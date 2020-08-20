'use strict'

const stream = require('stream');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_S3_PREFIX = process.env.AWS_S3_PREFIX;
const AWS_STORAGE_TYPE = process.env.AWS_STORAGE_TYPE || 'STANDARD';

const uploadStream = (key, type) => {
  if (AWS_S3_PREFIX) {
    key = `${AWS_S3_PREFIX}${key}`
  }

  const pass = new stream.PassThrough();
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: pass,
    StorageClass: type || AWS_STORAGE_TYPE
  };

  return {
    writeStream: pass,
    uploadPromise: S3.upload(params).promise(),
  };
}

exports = module.exports = {
  uploadStream
};
