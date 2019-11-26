'use strict'

require("dotenv").config();

const Fs = require('fs');
const Util = require('util');
const Path = require('path');
const AWSTools = require('./lib/aws-tools');

const ROOT_FOLDER = process.env.ROOT_FOLDER;
const HOURS_THRESHOLD = process.env.FILE_AGE_THRESHOLD_HOURS;
const HOURS_PER_MS = 36e5;

const fsStat = Util.promisify(Fs.stat);

const handleFile = async (file) => {
  console.log(file);

  try {
    const stats = await fsStat(file);
    const hours = Math.abs(new Date() - stats.birthtime) / HOURS_PER_MS;
    if (hours > HOURS_THRESHOLD) {
      // Flip Windows slashes
      const key = file.split(ROOT_FOLDER).join('').split('\\').join('/');
      console.log(key);

      const body = Fs.readFileSync(file);
      await AWSTools.upload(key, body);
    }
  } catch (error) {
    // Skip failed files, they will be handled on a subsequent run
    console.error(error);
  }
};

const handleDirectory = async (dirPath) => {
  try {
    const contents = Fs.readdirSync(dirPath);
    for (const content of contents) {
      const path = Path.join(dirPath, "/", content);
      if (Fs.statSync(path).isFile()) {
        await handleFile(path);
      } else {
        await handleDirectory(path);
      }
    }
  } catch (error) {
    // Skip any directories which we are not allowed to read
    console.error(error);
  }
};

const start = async () => {
  console.log(`Archive started '${ROOT_FOLDER}'`);

  await handleDirectory(ROOT_FOLDER);

  console.log(`Archive finished '${ROOT_FOLDER}'`);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
