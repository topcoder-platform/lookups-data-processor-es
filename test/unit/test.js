/**
 * Mocha tests of the Lookups ES Processor.
 */

process.env.NODE_ENV = 'test'
require('../../src/bootstrap')
const _ = require('lodash')
const should = require('should')
const logger = require('../../src/common/logger')
const service = require('../../src/services/ProcessorService')
const { fields, testTopics } = require('../common/testData')
const { init, clearES } = require('../common/init-es')
const testHelper = require('../common/testHelper')

describe('Topcoder - Lookups ES Processor Unit Test', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  /**
   * Assert validation error
   * @param err the error
   * @param message the message
   */
  const assertValidationError = (err, message) => {
    err.isJoi.should.be.true()
    should.equal(err.name, 'ValidationError')
    err.details.map(x => x.message).should.containEql(message)
    errorLogs.should.not.be.empty()
  }

  before(async () => {
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

    await init(true)
  })

  after(async () => {
    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    await clearES()
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
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

        await service[`process${op}`](testTopics[op][i])

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
        }
      })

      if (op === 'Create') {
        it(`failure - process create ${resource} with duplicate id`, async () => {
          try {
            await service.processCreate(testTopics[op][i])
            throw new Error('should not throw error here')
          } catch (e) {
            should.equal(e.statusCode, 409)
            e.message.should.startWith('[version_conflict_engine_exception]')
          }
        })
      }

      if (op === 'Delete') {
        it(`failure - process delete ${resource} not found`, async () => {
          try {
            await service.processDelete(testTopics[op][i])
            throw new Error('should not throw error here')
          } catch (e) {
            should.equal(e.statusCode, 404)
            should.equal(e.message, 'Not Found')
          }
        })
      }
    }

    let { requiredFields, stringFields } = fields[op]

    for (const requiredField of requiredFields) {
      it(`test process ${_.lowerFirst(op)} message with invalid parameters, required field ${requiredField} is missing`, async () => {
        let message = _.cloneDeep(testTopics[op][0])
        message = _.omit(message, requiredField)
        try {
          await service[`process${op}`](message)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${_.last(requiredField.split('.'))}" is required`)
        }
      })
    }

    for (const stringField of stringFields) {
      it(`test process ${_.lowerFirst(op)} message with invalid parameters, invalid string type field ${stringField}`, async () => {
        let message = _.cloneDeep(testTopics[op][0])
        _.set(message, stringField, 123)
        try {
          await service[`process${op}`](message)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
        }
      })
    }

    it(`test process ${_.lowerFirst(op)} message with invalid parameters, invalid string field payload.id`, async () => {
      let message = _.cloneDeep(testTopics[op][0])
      _.set(message, 'payload.id', '12345')
      try {
        await service[`process${op}`](message)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"id" must be a valid GUID`)
      }
    })

    it(`test process ${_.lowerFirst(op)} message with incorrect resource, message is ignored`, async () => {
      let message = _.cloneDeep(testTopics[op][0])
      message.payload.resource = 'invalid'
      await service[`process${op}`](message)
      should.equal(_.last(infoLogs), 'Ignore this message since resource is not in [country,educationalInstitution,device]')
    })
  }
})
