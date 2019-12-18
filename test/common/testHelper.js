/**
 * Contains generic helper methods
 */

const config = require('config')
const helper = require('../../src/common/helper')

var client
(async function() {
  client =  await helper.getESClient()
})();

/**
 * Get country by id from ES.
 * @param {String} id the country id
 * @return {Object} the country entity
 */
async function getCountry (id) {
  return client.getSource({
    index: config.get('ES.COUNTRY_INDEX'),
    type: config.get('ES.COUNTRY_TYPE'),
    id
  })
}

/**
 * Get educational institution by id from ES.
 * @param {String} id the educational institution id
 * @return {Object} the educational institution entity
 */
async function getEducationalInstitution (id) {
  return client.getSource({
    index: config.get('ES.EDUCATIONAL_INSTITUTION_INDEX'),
    type: config.get('ES.EDUCATIONAL_INSTITUTION_TYPE'),
    id
  })
}

/**
 * Get device by id from ES.
 * @param {String} id the device id
 * @return {Object} the device entity
 */
async function getDevice (id) {
  return client.getSource({
    index: config.get('ES.DEVICE_INDEX'),
    type: config.get('ES.DEVICE_TYPE'),
    id
  })
}

module.exports = {
  getCountry,
  getEducationalInstitution,
  getDevice
}
