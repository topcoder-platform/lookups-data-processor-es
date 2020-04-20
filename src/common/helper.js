/**
 * Contains generic helper methods
 */

// eslint-disable-next-line
const AWS = require('aws-sdk')
const config = require('config')
const elasticsearch = require('elasticsearch')

// Elasticsearch client
let esClient

/**
 * Get Kafka options
 * @return {Object} the Kafka options
 */
function getKafkaOptions () {
  const options = { connectionString: config.KAFKA_URL, groupId: config.KAFKA_GROUP_ID }
  if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
    options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
  }
  return options
}

/**
 * Get ES Client
 * @return {Object} Elasticsearch Client Instance
 */
async function getESClient () {
  if (esClient) {
    return esClient
  }
  const hosts = config.ES.HOST
  const apiVersion = config.ES.API_VERSION

  // AWS ES configuration is different from other providers
  if (/.*amazonaws.*/.test(hosts)) {
    esClient = new elasticsearch.Client({
      apiVersion,
      hosts
    })
  } else {
    esClient = new elasticsearch.Client({
      apiVersion,
      hosts
    })
  }
  return esClient
}

module.exports = {
  getKafkaOptions,
  getESClient
}
