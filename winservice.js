'use strict'

require('dotenv').config();

const Service = require('node-windows').Service;

const service = new Service({
  name: 'Node S3 Archive SErvice',
  description: 'The S3 Glacier archive service.',
  script: `${process.cwd()}\\index.js`,
  wait: 43200,
  grow: 0
});

service.on('install', function () {
  service.start();
});

service.on('uninstall', function () {
  console
});

const install = () => {
  service.install();
};

const uninstall = () => {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
};

exports = module.exports = {
  install,
  uninstall
};
