/**
 * E2E test of the Lookups ES Processor.
 */
require('../../src/bootstrap')
process.env.NODE_ENV = 'test'

const _ = require('lodash')
const config = require('config')
const helper = require('../../src/common/helper')
const request = require('superagent')
const Kafka = require('no-kafka')
const should = require('should')
const logger = require('../../src/common/logger')
const { fields, testTopics } = require('../common/testData')
const { init, clearES } = require('../common/init-es')
const testHelper = require('../common/testHelper')

describe('Topcoder - Lookups ES Processor E2E Test', () => {
  let app
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  const producer = new Kafka.Producer(helper.getKafkaOptions())

  /**
   * Sleep with time from input
   * @param time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  /**
   * Send message
   * @param testMessage the test message
   */
  async function sendMessage (testMessage) {
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(testMessage)
      }
    })
  }

  /**
   * Consume not committed messages before e2e test
   */
  async function consumeMessages () {
    // remove all not processed messages
    const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
    await consumer.init([{
      subscriptions: [config.LOOKUP_CREATE_TOPIC, config.LOOKUP_UPDATE_TOPIC, config.LOOKUP_DELETE_TOPIC],
      handler: (messageSet, topic, partition) => Promise.each(messageSet,
        (m) => consumer.commitOffset({ topic, partition, offset: m.offset }))
    }])
    // make sure process all not committed messages before test
    await sleep(2 * config.WAIT_TIME)
    await consumer.end()
  }

  /**
   * Wait job finished with successful log or error log is found
   */
  async function waitJob () {
    while (true) {
      if (errorLogs.length > 0) {
        break
      }
      if (debugLogs.some(x => String(x).includes('Successfully processed message'))) {
        break
      }
      // use small time to wait job and will use global timeout so will not wait too long
      await sleep(config.WAIT_TIME)
    }
  }

  function assertErrorMessage (message) {
    errorLogs.should.not.be.empty()
    errorLogs.some(x => String(x).includes(message)).should.be.true()
  }

  before(async () => {
    await init(true)

    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }
    await consumeMessages()
    // start kafka producer
    await producer.init()
    // start the application (kafka listener)
    app = require('../../src/app')
    // wait until consumer init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Kick Start'))) {
        break
      }
      await sleep(config.WAIT_TIME)
    }
  })

  after(async () => {
    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    try {
      await producer.end()
    } catch (err) {
      // ignore
    }
    try {
      await app.end()
    } catch (err) {
      // ignore
    }

    await clearES()
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('Should setup healthcheck with check on kafka connection', async () => {
    const healthcheckEndpoint = `http://localhost:${process.env.PORT || 3000}/health`
    let result = await request.get(healthcheckEndpoint)
    should.equal(result.status, 200)
    should.deepEqual(result.body, { checksRun: 1 })
    debugLogs.should.match(/connected=true/)
  })

  it('Should handle invalid json message', async () => {
    await producer.send({
      topic: testTopics.Create[0].topic,
      message: {
        value: '[ invalid'
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'Invalid message JSON.')
  })

  it('Should handle incorrect topic field message', async () => {
    let message = _.cloneDeep(testTopics.Create[0])
    message.topic = 'invalid'
    await producer.send({
      topic: testTopics.Create[0].topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'The message topic invalid doesn\'t match the Kafka topic lookup.notification.create.')
  })

  for (const op of ['Create', 'Update', 'Delete']) {
    for (let i = 0; i < testTopics[op].length; i++) {
      let resource = _.upperFirst(testTopics[op][i].payload.resource)
      it(`process ${_.lowerFirst(op)} ${resource} success`, async () => {
        if (op === 'Delete' || (op === 'Update' && i <= 2)) {
          // ensure document exist before delete or update
          try {
            await testHelper[`get${resource}`](testTopics[op][i].payload.id)
          } catch (e) {
            throw new Error('should not throw error here')
          }
        }

        if (op === 'Update' && i >= 3) {
          // ensure document doesn't exist before update
          // when perform update operation later, it will create such document in ES
          try {
            await testHelper[`get${resource}`](testTopics[op][i].payload.id)
            throw new Error('should not throw error here')
          } catch (e) {
            should.equal(e.statusCode, 404)
            e.message.should.startWith('[resource_not_found_exception]')
          }
        }

        await sendMessage(testTopics[op][i])
        await waitJob()

        if (op === 'Delete') {
          // ensure document not exist after delete
          try {
            await testHelper[`get${resource}`](testTopics[op][i].payload.id)
            throw new Error('should not throw error here')
          } catch (e) {
            should.equal(e.statusCode, 404)
            e.message.should.startWith('[resource_not_found_exception]')
          }
        } else {
          let ret = await testHelper[`get${resource}`](testTopics[op][i].payload.id)
          should.equal(ret.id, testTopics[op][i].payload.id)
          should.equal(ret.name, testTopics[op][i].payload.name)
        }
      })

      if (op === 'Create') {
        it(`failure - process create ${resource} with duplicate id`, async () => {
          await sendMessage(testTopics[op][i])
          await waitJob()

          assertErrorMessage('[version_conflict_engine_exception]')
        })
      }

      if (op === 'Delete') {
        it(`failure - process delete ${resource} not found`, async () => {
          await sendMessage(testTopics[op][i])
          await waitJob()

          assertErrorMessage('Not Found')
        })
      }
    }

    let { requiredFields, stringFields } = fields[op]

    for (const requiredField of requiredFields) {
      it(`test process ${_.lowerFirst(op)} message with invalid parameters, required field ${requiredField} is missing`, async () => {
        let message = _.cloneDeep(testTopics[op][0])
        message = _.omit(message, requiredField)

        await sendMessage(message)
        await waitJob()

        assertErrorMessage(`"${_.last(requiredField.split('.'))}" is required`)
      })
    }

    for (const stringField of stringFields) {
      it(`test process ${_.lowerFirst(op)} message with invalid parameters, invalid string type field ${stringField}`, async () => {
        let message = _.cloneDeep(testTopics[op][0])
        _.set(message, stringField, 123)

        await sendMessage(message)
        await waitJob()

        assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
      })
    }

    it(`test process ${_.lowerFirst(op)} message with invalid parameters, invalid string field payload.id`, async () => {
      let message = _.cloneDeep(testTopics[op][0])
      _.set(message, 'payload.id', '12345')

      await sendMessage(message)
      await waitJob()

      assertErrorMessage(`"id" must be a valid GUID`)
    })

    it(`test process ${_.lowerFirst(op)} message with incorrect resource, message is ignored`, async () => {
      let message = _.cloneDeep(testTopics[op][0])
      message.payload.resource = 'invalid'

      await sendMessage(message)
      await waitJob()

      should.equal(_.last(infoLogs), 'Ignore this message since resource is not in [country,educationalInstitution,device]')
    })
  }
})
