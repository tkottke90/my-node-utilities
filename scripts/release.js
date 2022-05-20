const DrawUtils = require('../modules/draw');
const FileUtils = require('../modules/file-utils');
const { exec } = require('child_process');
const path = require('path');
const package = require('../package.json');
const {promisify} = require('util');

const execPromise = promisify(exec);

DrawUtils.drawTerminalHeader({
  scriptName: 'Release My-Note-Utilities',
  version: '1.0.0',
  author: 'Thomas Kottke <t.kottke90@gmail.com>',
  buildDate: '05/20/2022'
});

const today = new Date();
const versionString = `v${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

async function main() {
  // Update package.json with new version
  const packageUpdateTask = DrawUtils.drawTask(`Updating package.json`, 'UPDATING', 'DONE');
  await FileUtils
    .writeJSON(path.resolve(__dirname, '../package.json'), {...package, version: versionString }, true)
    .then(() => {
      packageUpdateTask();
    })
    .catch((error) => {
      packageUpdateTask('ERROR')
      console.dir(error);
      process.exit(1);
    })

  const commitTask = DrawUtils.drawTask(`Creating Release Commit`, 'CREATING', 'DONE');
  await execPromise(`git add package.json`);
  await execPromise(`git commit -m 'release: ${versionString}'`);
  commitTask();

  const checkExistingTask = DrawUtils.drawTask(`Checking for tag: ${versionString}`, 'CHECKING', 'NOT FOUND');
  const tagList = await execPromise(`git tag`)

  // If a tag with todays already exists, remove it first and then replace it
  // in the new position
  if (tagList.stdout.includes(versionString)) {
    checkExistingTask('FOUND');
    // Get commit sha for tag
    const tagSha = await execPromise(`git rev-list -n 1 tags/${versionString}`);
    
    const removalTask = DrawUtils.drawTask(`Removing tag from sha: ${tagSha.stdout.replace('\n', '')}`, 'REMOVING', 'DONE');
    await execPromise(`git tag -d ${versionString}`);
    removalTask();
  } else {
    checkExistingTask();
  }


  const creationTask = DrawUtils.drawTask(`Creating Tag: ${versionString}`, 'CREATING', 'DONE');
  const { stderr } = await execPromise(`git tag -a '${versionString}' -m ''`)

  if (stderr) {
    creationTask('ERROR');
    console.log(stderr);
    process.exit(1);
  } else {
    creationTask();
  }

  await execPromise('git push --tags');

  console.log('=> Release Complete');
}

main();