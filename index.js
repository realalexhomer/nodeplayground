require('dotenv').config();

const AWS = require('aws-sdk');
const fs = require('fs');
const uuid = require ('uuid/v4');

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ID,
    secretAccessKey: process.env.SECRET
});

const s3 = new AWS.S3();

const uploadFile = (fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    const videoUuid = uuid() + '.mp4';

    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.SOURCE_BUCKET_NAME,
        // This needs to be a uuid with an .mp4 extension. We will use this later to find our video in dynamoDB.
        // if there is no mp4 extension the upload to the bucket will succeed but it wont move on through the distribution.
        Key: videoUuid,
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }

        console.log('data is', data);
        console.log(`File uploaded successfully. ${data.Location}`);

        // Hack because we do not know the actual guid for the video in DynamoDB. Scan for the uuid
        // in the srcVideo field. Obviously not very efficient if we have a lot of videos but we shouldnt.
        // Alternatively we could possibly use an sns to get the real guid. This has some technical hurdles though:
        // https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html#SendMessageToHttp.prepare
        
        setTimeout(() => { 
            // make sure video is in dynamoDB before we query it. 5 seconds
            // is arbitrary, we may need to increase this or poll for it depending on how video size 
            // impacts the delay.
            
            const docClient = new AWS.DynamoDB.DocumentClient();

            const ddbParams = {
                TableName: process.env.DYNAMO_DB_BUCKET_NAME,
                FilterExpression:"#srcVideo = :srcVideo",
                ExpressionAttributeNames: {
                    "#srcVideo":"srcVideo",
                },
                ExpressionAttributeValues: {
                    ":srcVideo": videoUuid
                }
            }
    
            docClient.scan(ddbParams, function(err, data) {
                if (err) {
                    console.log('dynamoDB err is', err)
                } else {
                    console.log('item is', data.Items[0])
                }
              });
        }, 1000 * 5)
    });
};

uploadFile('test.mp4');