import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const sqsClient = new SQSClient({ region: "us-east-1" });

const tableName = process.env.DYNAMODB_TABLE_NAME!;
const queueUrl = process.env.SQS_QUEUE_URL!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Example: Retrieve an item from DynamoDB
    const getItemCommand = new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: "123" },
      },
    });

    const data = await dynamoDBClient.send(getItemCommand);
    console.log("DynamoDB GetItem Response:", data);
    console.log("DynamoDB GetItem Response: jitender");

    // Example: Send a message to SQS
    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ message: "Hello SQS!" }),
    });

    const sqsResponse = await sqsClient.send(sendMessageCommand);
    console.log("SQS SendMessage Response:", sqsResponse);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
        data: data.Item,
      }),
    };
  } catch (error:unknown) {
    console.error("Error processing Lambda function", error);
    let errormessage = "Internal server error";
    if(error instanceof Error)
    {
      errormessage = error.message
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: errormessage,
      }),
    };
  }
};
