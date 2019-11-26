'use strict'

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_STORAGE_TYPE = process.env.AWS_STORAGE_TYPE || 'STANDARD';

const S3UploadPromise = (params) => {
  return new Promise((resolve, reject) => {
    S3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const upload = async (key, body) => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body,
    StorageClass: AWS_STORAGE_TYPE
  };

  return S3UploadPromise(params);
};

exports = module.exports = {
  upload
};
