const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Sentry = require('@sentry/node');


Sentry.init({ dsn: 'https://8b01fbfa1ad4401eb6deed669715507e@o396786.ingest.sentry.io/5250628' });


const s3 = new aws.S3({
   
  accessKeyId: process.env.AWS_ACCES_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  defaultRegion:process.env.AWS_DEFAULT_REGION
  
  });

const PostSchema =new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PostSchema.pre('save', function(){
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

PostSchema.pre('remove', function() {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3.deleteObject({
      Bucket: 'upload-project-leveske',
      Key: this.key,
    }).promise()
  } else {
    return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key));
  }
})

module.exports = mongoose.model("Post", PostSchema);