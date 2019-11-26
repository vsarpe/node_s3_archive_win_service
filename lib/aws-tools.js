'use strict'

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

const S3UploadPromise = (params) => {
  return new Promise((success, fail) => {
    S3.upload(params, (err, data) => {
      if (err) {
        fail(err);
      } else {
        success(data);
      }
    });
  });
};

const upload = async (key, body) => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body
  };

  return S3UploadPromise(params);
};

exports = module.exports = {
  upload
};
