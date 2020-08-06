'use strict'

const up = async (DBManager) => {
  await DBManager.run(`ALTER TABLE files ADD deleted INT NOT NULL DEFAULT 0;`);
  await DBManager.run(`UPDATE files SET deleted = 1;`);
  await DBManager.run(`CREATE INDEX files_original_path_idx ON files (original_path);`);
  await DBManager.run(`CREATE INDEX migrations_name_idx ON migrations (name);`);
}

const down = async (DBManager) => {
  // skip for now.. dropping columns is messy in sqlite
}

exports = module.exports = {
  up,
  down
};
