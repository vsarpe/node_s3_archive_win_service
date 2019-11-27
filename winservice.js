'use strict'

require('dotenv').config();

const argv = require('yargs').argv;
const Service = require('node-windows').Service;

const getService = () => {
  const service = new Service({
    name: 'Node S3 Archive Service',
    description: 'The S3 Glacier archive service.',
    script: `${process.cwd()}\\index.js`
  });

  service.on('install', function () {
    service.start();
    console.log('Service installed.');
  });

  service.on('uninstall', function () {
    service.stop();
    console.log('Service uninstalled.');
  });

  return service;
};

const install = () => {
  console.log('Installing service...');

  const service = getService();
  service.install();
};

const uninstall = () => {
  console.log('Uninstalling service...');

  const service = getService();
  service.uninstall();
};

if (argv.install) {
  install();
} else if (argv.uninstall) {
  uninstall();
}
