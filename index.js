'use strict'

require("dotenv").config();

const fs = require('fs');
const util = require('util');
const path = require('path');
const AWSManager = require('./lib/aws-manager');
const DBManager = require('./lib/db-manager');

const DB_FILE = process.env.DB_FILE;
const ROOT_FOLDER = process.env.ROOT_FOLDER;
const HOURS_THRESHOLD = process.env.FILE_AGE_THRESHOLD_HOURS;
const HOURS_PER_MS = 36e5;

const fsStat = util.promisify(fs.stat);

const handleFile = async (file) => {
  try {
    const stats = await fsStat(file);
    const hours = Math.abs(new Date() - stats.birthtime) / HOURS_PER_MS;
    if (hours > HOURS_THRESHOLD) {
      // Flip Windows slashes
      const key = file.split(ROOT_FOLDER).join('').split('\\').join('/');
      const body = fs.readFileSync(file);
      const result = await AWSManager.upload(key, body);
      const insert = await DBManager.run(`INSERT INTO files(original_path, s3_location, s3_bucket, s3_key) VALUES ('${file}', '${result.Location}', '${result.Bucket}', '${result.Key}')`);
      if (insert) {
        // Delete file after successful download
        fs.unlinkSync(file);
      }
    }
  } catch (error) {
    // Skip failed files, they will be handled on a subsequent run
    console.error(error);
  }
};

const handleDirectory = async (dirPath) => {
  try {
    const contents = fs.readdirSync(dirPath);
    for (const content of contents) {
      const fullPath = path.join(dirPath, content);
      if (fs.statSync(fullPath).isFile()) {
        await handleFile(fullPath);
      } else {
        await handleDirectory(fullPath);
      }
    }
  } catch (error) {
    // Skip any directories which we are not allowed to read
    console.error(error);
  }
};

const start = async () => {
  console.log(`Archive started '${ROOT_FOLDER}'`);

  await DBManager.open(DB_FILE);
  await DBManager.initialize();
  await handleDirectory(ROOT_FOLDER);
  await DBManager.close();

  console.log(`Archive finished '${ROOT_FOLDER}'`);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
