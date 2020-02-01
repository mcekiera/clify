'use strict';

const fs = require('fs');
const path = require('path');
const { logFileLoad } = require('./messages');

const dir = './temp';

async function save(fileName, content) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const data = JSON.stringify(content);
  fs.writeFileSync(`${dir}/${fileName}.json`, data);
  return true;
}

async function load(fileName) {
  return new Promise((resolve, reject) => fs.readFile(`${dir}/${fileName}`, (err, data) => {
    if (err) {
      reject(err);
    }

    const content = JSON.parse(data);
    logFileLoad(fileName, content);
    resolve(content);
  }));
}

async function listFiles() {
  return new Promise((resolve, reject) => fs.readdir(path.join(process.cwd(), dir), (err, files) => {
    if (err) {
      reject(err);
    }

    resolve(files);
  }));
}

module.exports = {
  save,
  load,
  listFiles,
};
