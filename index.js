'use strict'

require('dotenv').config();

const fs = require('fs');
const util = require('util');
const path = require('path');
const schedule = require('node-schedule');
const argv = require('yargs').argv;
const AWSManager = require('./lib/aws-manager');
const DBManager = require('./lib/db-manager');

const DB_FILE = process.env.DB_FILE;
const ROOT_FOLDER = process.env.ROOT_FOLDER;
const HOURS_THRESHOLD = process.env.FILE_AGE_THRESHOLD_HOURS;
const HOURS_PER_MS = 36e5;

const fsStat = util.promisify(fs.stat);

let isRunning = false;

const handleFile = async (file, jobId) => {
  try {
    const stats = await fsStat(file);
    const hours = Math.abs(new Date() - stats.birthtime) / HOURS_PER_MS;
    if (hours > HOURS_THRESHOLD) {
      // Flip Windows slashes
      const key = file.split(ROOT_FOLDER).join('').split('\\').join('/');
      const body = fs.readFileSync(file);
      const result = await AWSManager.upload(key, body);
      const insert = await DBManager.insert(`INSERT INTO files(original_path, job_id, s3_location, s3_bucket, s3_key, size) VALUES ('${file}', '${jobId}', '${result.Location}', '${result.Bucket}', '${result.Key}', '${stats.size}')`);
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

const handleDirectory = async (dirPath, jobId) => {
  try {
    const contents = fs.readdirSync(dirPath);
    for (const content of contents) {
      const fullPath = path.join(dirPath, content);
      if (fs.statSync(fullPath).isFile()) {
        await handleFile(fullPath, jobId);
      } else {
        await handleDirectory(fullPath, jobId);
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

  const jobId = await DBManager.insert(`INSERT INTO jobs(folder, hours_threshold) VALUES ('${ROOT_FOLDER}', '${HOURS_THRESHOLD}')`);
  await handleDirectory(ROOT_FOLDER, jobId);

  await DBManager.close();

  console.log(`Archive finished '${ROOT_FOLDER}'`);
};

if (argv.once) {
  start().catch(console.error);
} else {
  // Run every day at 1am
  const rule = new schedule.RecurrenceRule();
  rule.hour = 1;
  rule.minute = 0;

  schedule.scheduleJob(rule, () => {
    if (!isRunning) {
      isRunning = true;
      start()
        .then(() => {
          isRunning = false;
        })
        .catch((error) => {
          isRunning = false;
          console.error(error);
        });
    } else {
      console.info('Task has not yet finished. Will try again next schedule.')
    }
  });
}
