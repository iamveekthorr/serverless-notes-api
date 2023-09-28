import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverless-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      NOTES_TABLE: 'notes',
    },
    stage: 'dev',
  },
  // import the function via paths
  functions: {},
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      start: {
        port: 5000,
        inMemory: true,
        migrate: true,
      },
      stages: 'dev',
    },
  },
  resources: {
    Resources: {
      NotesTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
          TableName: '${env.NOTES_TABLE}',
          AttributeDefinitions: [
            {
              AttributeName: 'user_id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'timestamp',
              AttributeType: 'N',
            },
            {
              AttributeName: 'note_id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'user_id',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'timestamp',
              KeyStamp: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacity: 1,
            WriteCapacity: 1,
          },
          GlobalSecondaryIndex: [
            {
              IndexName: 'note_id-index',
              KeySchema: [
                {
                  AttributeName: 'note_id',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacity: 1,
                WriteCapacity: 1,
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
