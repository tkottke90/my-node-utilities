const DrawUtils = require('../modules/draw');
const FileUtils = require('../modules/file-utils');
const { exec } = require('child_process');
const path = require('path');
const package = require('../package.json');

DrawUtils.drawTerminalHeader({
  scriptName: 'Release My-Note-Utilities',
  version: '1.0.0',
  author: 'Thomas Kottke <t.kottke90@gmail.com>',
  buildDate: '05/20/2022'
});

const today = new Date();
const versionString = `v${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

exec(`git tag -a '${versionString}' -m ''`, (error, stdout, stderr) => {
  if (error) {
    console.dir(error)
    return;
  }

  FileUtils.writeJSON(path.resolve(__dirname, '../package.json'), {...package, version: versionString }, true);
});