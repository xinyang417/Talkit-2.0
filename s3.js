const S3 = require('aws-sdk/clients/s3');


const AWS_BUCKET_NAME="talkit-app"
const AWS_BUCKET_REGION="us-east-1"
const AWS_ACCESS_KEY="AKIAUHPDRED7TCCMRVR5"
const AWS_SECRET_KEY="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"

const s3 = new S3({
    AWS_BUCKET_REGION,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY
})

function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile