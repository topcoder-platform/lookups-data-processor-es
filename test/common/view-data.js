/**
 * This is used to view Elasticsearch data of given id
 * Usage:
 * node test/view-data <country/educationalInstitution> {elasticsearch-id}
 */
const _ = require('lodash')
const config = require('config')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')

// valid resource
const validResources = ['country', 'educationalInstitution']

var client
(async function () {
  client = await helper.getESClient()
})()

// ES index and type
const index = {
  country: config.get('ES.COUNTRY_INDEX'),
  educationalInstitution: config.get('ES.EDUCATIONAL_INSTITUTION_INDEX')
}
const type = {
  country: config.get('ES.COUNTRY_TYPE'),
  educationalInstitution: config.get('ES.EDUCATIONAL_INSTITUTION_TYPE')
}

if (process.argv.length < 4) {
  logger.error('Missing argument for Resource and Elasticsearch id.')
  process.exit()
}

const view = async (resource, id) => {
  if (_.includes(validResources, resource)) {
    let ret = await client.getSource({ index: index[resource], type: type[resource], id })
    logger.info('Elasticsearch data:')
    logger.info(JSON.stringify(ret, null, 4))
  } else {
    logger.warn(`resource is invalid, it should in [${validResources}]`)
  }
}

view(process.argv[2], process.argv[3]).then(() => {
  process.exit()
}).catch((e) => {
  if (e.statusCode === 404) {
    logger.info('The data is not found.')
  } else {
    logger.error(e)
  }
  process.exit()
})
