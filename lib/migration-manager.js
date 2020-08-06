'use strict'

const fs = require('fs');
const DBManager = require('./db-manager');

const runMigrations = async () => {
  const newMigrations = [];
  const allMigrations = fs.readdirSync('./migrations');

  for (const migration of allMigrations) {
    const rows = await DBManager.select(`SELECT * FROM migrations WHERE name = '${migration}' LIMIT 1;`);
    if (!rows.length) {
      newMigrations.push(migration);
    }
  }

  for (const migration of newMigrations) {
    const migrationModule = require(`./../migrations/${migration}`);
    try {
      await migrationModule.up(DBManager);
      await DBManager.insert(`INSERT INTO migrations(name) VALUES ('${migration}');`);
      console.log(`Migration ${migration} finished.`);
    } catch (error) {
      console.error(error);
      try {
        console.log(`Migration ${migration} failed, attempting to undo...`);
        await migrationModule.down(DBManager);
        console.log(`Migration ${migration} undo successful.`);
      }
      catch (error2)
      {
        console.error(error2);
        console.error(`Migration ${migration} undo failed!`);
      }
    }
  }
}

exports = module.exports = {
  runMigrations
};
