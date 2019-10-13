/**
 * Processor Service
 */

const _ = require('lodash')
const Joi = require('@hapi/joi')
const config = require('config')
const HttpStatus = require('http-status-codes')
const logger = require('../common/logger')
const helper = require('../common/helper')

// valid resource
const validResources = ['country', 'educationalInstitution']

const client = helper.getESClient()

// ES index and type
const index = {
  country: config.get('ES.COUNTRY_INDEX'),
  educationalInstitution: config.get('ES.EDUCATIONAL_INSTITUTION_INDEX')
}
const type = {
  country: config.get('ES.COUNTRY_TYPE'),
  educationalInstitution: config.get('ES.EDUCATIONAL_INSTITUTION_TYPE')
}

/**
 * Process create lookup entity message
 * @param {Object} message the kafka message
 */
async function processCreate (message) {
  const resource = message.payload.resource
  if (_.includes(validResources, resource)) {
    await client.create({
      index: index[resource],
      type: type[resource],
      id: message.payload.id,
      body: _.omit(message.payload, 'resource'),
      refresh: 'true'
    })
  } else {
    logger.info(`Ignore this message since resource is not in [${validResources}]`)
  }
}

processCreate.schema = {
  message: Joi.object().keys({
    topic: Joi.string().required(),
    originator: Joi.string().required(),
    timestamp: Joi.date().required(),
    'mime-type': Joi.string().required(),
    payload: Joi.object().keys({
      resource: Joi.string().required(),
      id: Joi.id(),
      name: Joi.string().required(),
      countryFlag: Joi.string(),
      countryCode: Joi.string()
    }).required()
  }).required()
}

/**
 * Process update lookup entity message
 * @param {Object} message the kafka message
 */
async function processUpdate (message) {
  const resource = message.payload.resource
  if (_.includes(validResources, resource)) {
    try {
      await client.update({
        index: index[resource],
        type: type[resource],
        id: message.payload.id,
        body: { doc: _.omit(message.payload, 'resource') },
        refresh: 'true'
      })
    } catch (e) {
      if (e.statusCode === HttpStatus.NOT_FOUND) {
        // not found in ES, then create data in ES
        await processCreate(message)
      } else {
        // re-throw other errors
        throw e
      }
    }
  } else {
    logger.info(`Ignore this message since resource is not in [${validResources}]`)
  }
}

processUpdate.schema = {
  message: Joi.object().keys({
    topic: Joi.string().required(),
    originator: Joi.string().required(),
    timestamp: Joi.date().required(),
    'mime-type': Joi.string().required(),
    payload: Joi.object().keys({
      resource: Joi.string().required(),
      id: Joi.id(),
      name: Joi.string(),
      countryFlag: Joi.string(),
      countryCode: Joi.string()
    }).required()
  }).required()
}

/**
 * Process delete lookup entity message
 * @param {Object} message the kafka message
 */
async function processDelete (message) {
  const resource = message.payload.resource
  if (_.includes(validResources, resource)) {
    await client.delete({
      index: index[resource],
      type: type[resource],
      id: message.payload.id,
      refresh: 'true'
    })
  } else {
    logger.info(`Ignore this message since resource is not in [${validResources}]`)
  }
}

processDelete.schema = {
  message: Joi.object().keys({
    topic: Joi.string().required(),
    originator: Joi.string().required(),
    timestamp: Joi.date().required(),
    'mime-type': Joi.string().required(),
    payload: Joi.object().keys({
      resource: Joi.string().required(),
      id: Joi.id()
    }).required()
  }).required()
}

module.exports = {
  processCreate,
  processUpdate,
  processDelete
}

logger.buildService(module.exports)
