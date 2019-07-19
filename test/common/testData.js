module.exports = {
  fields: {
    Create: {
      requiredFields: ['payload.id', 'payload.resource', 'payload.name'],
      stringFields: ['payload.id', 'payload.resource', 'payload.name']
    },
    Update: {
      requiredFields: ['payload.id', 'payload.resource', 'payload.name'],
      stringFields: ['payload.id', 'payload.resource', 'payload.name']
    },
    Delete: {
      requiredFields: ['payload.id', 'payload.resource'],
      stringFields: ['payload.id', 'payload.resource']
    }
  },
  testTopics: {
    Create: [
      {
        topic: 'lookup.notification.create',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '7d458700-bd2d-4b23-ab71-e79455844dba',
          'resource': 'country',
          'name': 'US'
        }
      },
      {
        topic: 'lookup.notification.create',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f779-b28b-428f-888b-e523b444f5ea',
          'resource': 'educationalInstitution',
          'name': 'MIT'
        }
      }
    ],
    Update: [
      {
        topic: 'lookup.notification.update',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '7d458700-bd2d-4b23-ab71-e79455844dba',
          'resource': 'country',
          'name': 'UK'
        }
      },
      {
        topic: 'lookup.notification.update',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f779-b28b-428f-888b-e523b444f5ea',
          'resource': 'educationalInstitution',
          'name': 'LSE'
        }
      },
      {
        topic: 'lookup.notification.update',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '7d458700-bd2d-4b23-ab71-e79455844dbb',
          'resource': 'country',
          'name': 'China'
        }
      },
      {
        topic: 'lookup.notification.update',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f779-b28b-428f-888b-e523b444f5eb',
          'resource': 'educationalInstitution',
          'name': 'UCLA'
        }
      }
    ],
    Delete: [
      {
        topic: 'lookup.notification.delete',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '7d458700-bd2d-4b23-ab71-e79455844dba',
          'resource': 'country'
        }
      },
      {
        topic: 'lookup.notification.delete',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f779-b28b-428f-888b-e523b444f5ea',
          'resource': 'educationalInstitution'
        }
      }
    ]
  }
}
