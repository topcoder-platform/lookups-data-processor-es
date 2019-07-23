# Topcoder - Lookups ES Processor

## Dependencies 

- Nodejs(v8+)
- ElasticSearch
- Kafka

## Configuration

Configuration for the lookups es processor is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level; default value: 'debug'
- KAFKA_URL: comma separated Kafka hosts; default value: 'localhost:9092'
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- KAFKA_GROUP_ID: the Kafka group id, default value is 'lookups-processor-es'
- LOOKUP_CREATE_TOPIC: the create lookup entity Kafka message topic, default value is 'lookup.notification.create'
- LOOKUP_UPDATE_TOPIC: the update lookup entity Kafka message topic, default value is 'lookup.notification.update'
- LOOKUP_DELETE_TOPIC: the delete lookup entity Kafka message topic, default value is 'lookup.notification.delete'
- ES.HOST: Elasticsearch host
- ES.AWS_REGION: The Amazon region to use when using AWS Elasticsearch service
- ES.API_VERSION: Elasticsearch API version
- ES.COUNTRY_INDEX: Elasticsearch index name for countries
- ES.COUNTRY_TYPE: Elasticsearch index type for countries
- ES.EDUCATIONAL_INSTITUTION_INDEX: Elasticsearch index name for educational institutions
- ES.EDUCATIONAL_INSTITUTION_TYPE: Elasticsearch index type for educational institutions

There is a `/health` endpoint that checks for the health of the app. This sets up an expressjs server and listens on the environment variable `PORT`. It's not part of the configuration file and needs to be passed as an environment variable

Configuration for the tests is at `config/test.js`, only add such new configurations different from `config/default.js`

- WAIT_TIME: wait time used in test, default is 1500 or 1.5 second
- ES.COUNTRY_INDEX: Elasticsearch index name for countries in testing environment
- ES.EDUCATIONAL_INSTITUTION_INDEX: Elasticsearch index name for educational institutions in testing environment

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Linux/Mac, Windows will use bat commands in bin/windows instead
- download kafka at `https://www.apache.org/dyn/closer.cgi?path=/kafka/1.1.0/kafka_2.11-1.1.0.tgz`
- extract out the downloaded tgz file
- go to extracted directory kafka_2.11-0.11.0.1
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create the needed topics:
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic lookup.notification.create`

  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic lookup.notification.update`

  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic lookup.notification.delete`

- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics
- run the producer and then write some message into the console to send to the `lookup.notification.create` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic lookup.notification.create`
  in the console, write message, one message per line:
  `{ "topic": "lookup.notification.create", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "7d458700-bd2d-4b23-ab71-e79455844dba", "resource": "country", "name": "US" } }`
- optionally, use another terminal, go to same directory, start a consumer to view the messages:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic lookup.notification.create --from-beginning`
- writing/reading messages to/from other topics are similar

## ElasticSearch

1. start ElasticSearch server

2. Make sure you have properly set the configuration parameters.

3. initialize Elasticsearch, create configured Elasticsearch index: `npm run init-es force`

## Local deployment

1. Make sure that Kafka and Elasticsearch is running as per instructions above.

2. From the project root directory, run the following command to install the dependencies

    ```bash
    npm install
    ```

3. To run linters if required

    ```bash
    npm run lint
    ```

    To fix possible lint errors:

    ```bash
    npm run lint:fix
    ```

4. Initialize Elasticsearch index

    ```bash
    npm run init-es
    ```

    To delete and re-create the index:

    ```bash
    npm run init-es force
    ```

5. Start the processor and health check dropin

    ```bash
    npm start
    ```

## Local Deployment with Docker

To run the Lookups ES Processor using docker, follow the below steps

1. Navigate to the directory `docker`

2. Rename the file `sample.api.env` to `api.env`

3. Set the required AWS credentials and ElasticSearch host in the file `api.env`

4. Once that is done, run the following command

    ```bash
    docker-compose up
    ```

5. When you are running the application for the first time, It will take some time initially to download the image and install the dependencies

## Unit Tests and E2E Tests

- Run `npm run test` to execute unit tests.
- Run `npm run test:cov` to execute unit tests and generate coverage report.
- RUN `npm run e2e` to execute e2e tests.
- RUN `npm run e2e:cov` to execute e2e tests and generate coverage report.

## Verification

1. start kafka server, start elasticsearch, initialize Elasticsearch, start processor app
2. start kafka-console-producer to write messages to `lookup.notification.create`
topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic lookup.notification.create`
3. write message:
  `{ "topic": "lookup.notification.create", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "7d458700-bd2d-4b23-ab71-e79455844dba", "resource": "country", "name": "US" } }`
4. Watch the app console, It will show message successfully handled.
5. Run Command `npm run view-data country 7d458700-bd2d-4b23-ab71-e79455844dba` to verify the elastic data.
6. write message:
  `{ "topic": "lookup.notification.create", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "6605f779-b28b-428f-888b-e523b444f5ea", "resource": "educationalInstitution", "name": "MIT" } }`
7. Watch the app console, It will show message successfully handled.
8. Run Command `npm run view-data educationalInstitution 6605f779-b28b-428f-888b-e523b444f5ea` to verify the elastic data.
9. Repeat step 3 again and you will see error message in app console indicate conflict error.
10. start kafka-console-producer to write messages to `lookup.notification.update`
topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic lookup.notification.update`
11. write message:
  `{ "topic": "lookup.notification.update", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "7d458700-bd2d-4b23-ab71-e79455844dba", "resource": "country", "name": "UK" } }`
12. Watch the app console, It will show message successfully handled.
13. Repeat step 5 to verify elastic document has been updated
14. write message:
  `{ "topic": "lookup.notification.update", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "6605f779-b28b-428f-888b-e523b444f5ea", "resource": "educationalInstitution", "name": "LSE" } }`
15. Watch the app console, It will show message successfully handled.
16. Repeat step 8 to verify elastic document has been updated
17. start kafka-console-producer to write messages to `lookup.notification.delete`
topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic lookup.notification.delete`
18. write message:
  `{ "topic": "lookup.notification.delete", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "7d458700-bd2d-4b23-ab71-e79455844dba", "resource": "country" } }`
19. Watch the app console, It will show message successfully handled.
20. Repeat step 5 to verify elastic document has been deleted
21. write message:
  `{ "topic": "lookup.notification.delete", "originator": "lookups-api", "timestamp": "2019-07-08T00:00:00.000Z", "mime-type": "application/json", "payload": { "id": "6605f779-b28b-428f-888b-e523b444f5ea", "resource": "educationalInstitution" } }`
22. Watch the app console, It will show message successfully handled.
23. Repeat step 8 to verify elastic document has been deleted
24. Repeat step 18 and you will see error message in app console indicate not found error.
