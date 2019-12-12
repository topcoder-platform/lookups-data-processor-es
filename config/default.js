/**
 * The default configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  // below are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,

  // Kafka group id
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'lookups-processor-es',

  LOOKUP_CREATE_TOPIC: process.env.LOOKUP_CREATE_TOPIC || 'lookup.notification.create',
  LOOKUP_UPDATE_TOPIC: process.env.LOOKUP_UPDATE_TOPIC || 'lookup.notification.update',
  LOOKUP_DELETE_TOPIC: process.env.LOOKUP_DELETE_TOPIC || 'lookup.notification.delete',

  ES: {
    HOST: process.env.ES_HOST || 'localhost:9200',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1', // AWS Region to be used if we use AWS ES
    API_VERSION: process.env.ES_API_VERSION || '7.1',
    COUNTRY_INDEX: process.env.COUNTRY_INDEX || 'countries',
    COUNTRY_TYPE: process.env.COUNTRY_TYPE || '_doc',
    EDUCATIONAL_INSTITUTION_INDEX: process.env.EDUCATIONAL_INSTITUTION_INDEX || 'educational_institutions',
    EDUCATIONAL_INSTITUTION_TYPE: process.env.EDUCATIONAL_INSTITUTION_TYPE || '_doc',
    DEVICE_INDEX: process.env.DEVICE_INDEX || 'devices',
    DEVICE_TYPE: process.env.DEVICE_TYPE || '_doc'
  }
}
