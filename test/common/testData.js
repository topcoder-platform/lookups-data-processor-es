module.exports = {
  fields: {
    Create: {
      requiredFields: ['payload.id', 'payload.resource'],
      stringFields: ['payload.id', 'payload.resource']
    },
    Update: {
      requiredFields: ['payload.id', 'payload.resource'],
      stringFields: ['payload.id', 'payload.resource']
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
          'name': 'US',
          'countryCode': 'USA',
          'countryFlag': 'USA-CountryFlag'
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
      },
      {
        topic: 'lookup.notification.create',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f780-b28b-428f-888b-e523b444f5ea',
          'resource': 'device',
          'type': 'Desktop',
          'manufacturer': 'Apple',
          'model': 'Macbook Pro',
          'operatingSystem': 'OSX',
          'operatingSystemVersion': '10.14'
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
          'name': 'UK',
          'countryCode': 'UK',
          'countryFlag': 'UK-Flag'
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
          'id': '6605f780-b28b-428f-888b-e523b444f5ea',
          'resource': 'device',
          'type': 'Desktop'
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
          'name': 'China',
          'countryFlag': 'China-flag',
          'countryCode': 'China-code'
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
      },
      {
        topic: 'lookup.notification.delete',
        originator: 'lookups-api',
        timestamp: '2019-07-08T00:00:00.000Z',
        'mime-type': 'application/json',
        payload: {
          'id': '6605f780-b28b-428f-888b-e523b444f5ea',
          'resource': 'device'
        }
      }

    ]
  }
}
