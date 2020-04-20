/**
 * Initialize elastic search.
 * It will create configured index in elastic search if it is not present.
 * It can delete and re-create index if providing an extra 'force' argument.
 * Usage:
 * node src/init-es
 * node src/init-es force
 */

const config = require('config')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')

var client
(async function () {
  client = await helper.getESClient()
})()

/**
 * Create Elasticsearch index
 * @param {String} indexName the ES index name
 */
const createESIndex = async (indexName) => {
  // create index
  await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          name: {
            type: 'text',
            fielddata: true
          }
        }
      }
    }
  })
}

/**
 * Initialize elastic search index
 * @param {Boolean} isForce boolean flag indicate it is forced operation
 */
const init = async (isForce) => {
  if (isForce) {
    await clearES()
  }

  const cExists = await client.indices.exists({ index: config.ES.COUNTRY_INDEX })
  if (cExists) {
    logger.info(`The index ${config.ES.COUNTRY_INDEX} exists.`)
  } else {
    logger.info(`The index ${config.ES.COUNTRY_INDEX} will be created.`)
    await createESIndex(config.ES.COUNTRY_INDEX)
  }

  const eiExists = await client.indices.exists({ index: config.ES.EDUCATIONAL_INSTITUTION_INDEX })
  if (eiExists) {
    logger.info(`The index ${config.ES.EDUCATIONAL_INSTITUTION_INDEX} exists.`)
  } else {
    logger.info(`The index ${config.ES.EDUCATIONAL_INSTITUTION_INDEX} will be created.`)
    await createESIndex(config.ES.EDUCATIONAL_INSTITUTION_INDEX)
  }

  const dExists = await client.indices.exists({ index: config.ES.DEVICE_INDEX })
  if (dExists) {
    logger.info(`The index ${config.ES.DEVICE_INDEX} exists.`)
  } else {
    logger.info(`The index ${config.ES.DEVICE_INDEX} will be created.`)
    await createESIndex(config.ES.DEVICE_INDEX)
  }
}

/**
 * Delete elastic search index
 */
const clearES = async () => {
  logger.info(`Delete index ${config.ES.COUNTRY_INDEX} if any.`)
  try {
    await client.indices.delete({ index: config.ES.COUNTRY_INDEX })
  } catch (err) {
    // ignore
  }

  logger.info(`Delete index ${config.ES.EDUCATIONAL_INSTITUTION_INDEX} if any.`)
  try {
    await client.indices.delete({ index: config.ES.EDUCATIONAL_INSTITUTION_INDEX })
  } catch (err) {
    // ignore
  }

  logger.info(`Delete index ${config.ES.DEVICE_INDEX} if any.`)
  try {
    await client.indices.delete({ index: config.ES.DEVICE_INDEX })
  } catch (err) {
    // ignore
  }
}

if (!module.parent) {
  const isForce = process.argv.length === 3 && process.argv[2] === 'force'

  init(isForce).then(() => {
    logger.info('done')
    process.exit()
  }).catch((e) => {
    logger.error(e)
    process.exit()
  })
}

module.exports = {
  init,
  clearES
}
