'use strict'

const sqlite3 = require('sqlite3').verbose();
let db;

const open = (path) => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

const close = () => {
  return new Promise((resolve, reject) => {
    db.close((error) => {
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
    db.run(query, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

const initialize = async () => {
  const createTables = `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_path TEXT NOT NULL,
      s3_location TEXT NOT NULL,
      s3_bucket TEXT NOT NULL,
      s3_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTriggers = `
    CREATE TRIGGER IF NOT EXISTS [AutoUpdateAt]
    AFTER UPDATE
    ON files
    FOR EACH ROW
    BEGIN
      UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
    END
  `;

  await run(createTables);
  await run(createTriggers);

  return true;
};

exports = module.exports = {
  open,
  close,
  run,
  initialize
};
