const numberFormatter = Intl.NumberFormat('en-US', { minimumIntegerDigits: 3 });

/**
 * Generates a string of a given width wrapped with hash characters
 * @param {string} message Value to be displayed
 * @param {number} lineSize Width of the header
 * @param {boolean} [prefix] When true, places the space padding before the message
 * @returns 
 */
function wrapHeaderLine(message, lineSize, prefix = false) {
  const padding = ' '.repeat(lineSize - 4, - message.length);
  
  return prefix
    ? `# ${padding}${message} #`
    : `# ${message}${padding} #`
}

/**
 * @param {Object} DrawOptions
 * @param {string} DrawOptions.scriptName Name of the script
 * @param {string} [DrawOptions.version] Version of the script
 * @param {string} [DrawOptions.author] Author of the script
 * @param {string} [DrawOptions.buildDate] Date of the last revision of the script
 */
function drawTerminalHeader({ scriptName, version, author, buildDate }) {
  if (!scriptName) {
    throw new Error('Header must display script name');
  }

  version = version ?? '0.0.0';
  author = author ?? '';
  buildDate = buildDate ?? new Date().toLocaleDateString();
  
  const maxWidth = process.stdout.columns;
  const lineSizes = [
    scriptName.length,
    version.length,
    author.length,
    buildDate.length
  ]
    .map(line => line + 8) // Buffer each line with 6 characters so that the header has some space
    .sort((a, b) => a < b ? 1 : -1);

  const headerWidth = lineSizes < maxWidth ? lineSizes : maxWidth;
  const topBottom = '#'.repeat(headerWidth);

  const display = [
    topBottom,
    wrapHeaderLine(scriptName, headerWidth),
    wrapHeaderLine(version, headerWidth),
    wrapHeaderLine('', headerWidth),
    wrapHeaderLine(author, headerWidth, true),
    wrapHeaderLine(`Last Update: ${buildDate}`, headerWidth, true),
    topBottom
  ].join('\n');

  console.log(display);
}

/**
 * Draws a line to the console.  This is a broken down version of console.log because it does
 * not have an opinion about the end of the line and relies on the caller to manage where the
 * cursors position is.  The 2 parameters will be separated by space characters that span
 * the entire width of the current console window.
 * @param {string} lineStart The string to display at the start of the line
 * @param {string} [lineEnd] The string to display at the end of the line
 */
function drawLine(lineStart, lineEnd = '') {
  const padding = ' '.repeat(process.stdout.columns - (lineStart.length + lineEnd.length))
  process.stdout.write(`${lineStart}${padding}${lineEnd}`);
}

/**
 * Draws a new "Task" to the console.  The task will display as "active" until the returned
 * method is called.
 * @param {string} label The label to describe the task
 * @param {string} activeStatus The label to identify that something in a script is in progress
 * @param {string} completeStatus The label to identify that something in a script completed
 * @param {string} [prefix='=>'] Prefix to be used to identify that this is a Task
 * @returns {(error?: string) => void} Function to change the active status.  if passed a string
 * the the error string will be used instead of the complete status
 */
function drawTask(label, activeStatus, completeStatus, prefix = '=>') {
  const start = `${prefix} ${label}`;
  let end = ` ${activeStatus} \r`;

  drawLine(start, end);
  return (error) => {
    end = ` ${error ?? completeStatus} \n`
    drawLine(start, end);
  }
}

function drawProgressBar(label, { graphWidth, progressMarker, emptyMarker }) {
  graphWidth = graphWidth ?? 10;
  emptyMarker = emptyMarker ?? ' ';
  progressMarker = progressMarker ?? '#';
  
  
  function generateGraph(progress) {
    if (progress < 0 || progress > 1) {
      throw new Error('Progress bar value out of bounds');
    }
    
    const progressDisplay = numberFormatter.format(Math.round(progress * 100));
    const progressSize = Math.floor(progress * graphWidth);
    const progressBar = progressMarker.repeat(progressSize);
    const progressPadding = emptyMarker.repeat(graphWidth - progressSize);

    // If we hit 100%, then print new line otherwise move the cursor back to the start so we can
    // update with additional progress
    const lineEnding = progress === 1 ? '\n' : '\r';

    return ` [${progressBar}${progressPadding}] ${lineEnding}`;
  }

  return (progress) => {
    drawLine(generateGraph(progress));
  }
}

module.exports = {
  drawLine,
  drawTask,
  drawProgressBar,
  drawTerminalHeader
}