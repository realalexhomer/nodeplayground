# nodeplayground - upload a video to an s3 bucket

To run this, create a file with the name ".env", and copy and paste the below:
ID=''
SECRET=''
SOURCE_BUCKET_NAME='nurturevideos-source-8a1qchz6apby'
REGION='us-west-2'
DYNAMO_DB_BUCKET_NAME='nurturevideos'

Enter copied or downloaded access ID and secret key above, as well as your bucket name.


// AWS README

- File needs to have .mp4 extension or it will simply get stuck in the original s3 bucket. The upload will complete without an error but then it wont go anywhere.