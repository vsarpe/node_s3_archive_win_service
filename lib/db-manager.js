'use strict'

const sqlite3 = require('sqlite3').verbose();
let db;

const open = (path) => {
  return new Promise(function (resolve, reject) {
    db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

const close = () => {
  return new Promise(function (resolve, reject) {
    db.close(function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

const run = (query) => {
  return new Promise(function (resolve, reject) {
    db.run(query, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

const select = (query) => {
  return new Promise(function (resolve, reject) {
    db.all(query, function (error, rows) {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
};

const insert = (query) => {
  return new Promise(function (resolve, reject) {
    db.run(query, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

const initialize = async () => {
  const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder TEXT NOT NULL,
      hours_threshold INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createFilesTable = `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      original_path TEXT NOT NULL,
      s3_location TEXT NOT NULL,
      s3_bucket TEXT NOT NULL,
      s3_key TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_job_id FOREIGN KEY (job_id) REFERENCES jobs (id)
    );
  `;

  const createFilesAutoUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS [auto_update_files]
    AFTER UPDATE
    ON files
    FOR EACH ROW
    BEGIN
      UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
    END
  `;

  const createMigrationsTable = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await run(createJobsTable);
  await run(createFilesTable);
  await run(createFilesAutoUpdateTrigger);
  await run(createMigrationsTable);

  return true;
};

exports = module.exports = {
  open,
  close,
  run,
  select,
  insert,
  initialize
};
