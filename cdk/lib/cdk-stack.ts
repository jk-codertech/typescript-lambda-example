import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, Function } from 'aws-cdk-lib/aws-lambda';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class LambdaDynamoDBSQSStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB Table
    const dynamoDBTable = new Table(this, 'MyDynamoDBTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'MyTable',
    });

    // Create SQS Queue
    const sqsQueue = new Queue(this, 'MySQSQueue', {
      queueName: 'MyQueue',
    });

    // Lambda Function
    const lambdaFunction = new Function(this, 'MyLambdaFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'main.handler',
      code: Code.fromAsset('./dist'),
      environment: {
        DYNAMODB_TABLE_NAME: dynamoDBTable.tableName,
        SQS_QUEUE_URL: sqsQueue.queueUrl,
      },
    });

    // Grant Lambda permissions to interact with DynamoDB and SQS
    dynamoDBTable.grantReadData(lambdaFunction);
    sqsQueue.grantSendMessages(lambdaFunction);

    // Add IAM Policy for Lambda
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
      resources: [dynamoDBTable.tableArn],
    }));

    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: ['sqs:SendMessage'],
      resources: [sqsQueue.queueArn],
    }));
  }
}

