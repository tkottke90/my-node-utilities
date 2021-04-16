 /**
   * Taking in a number (n) convert to a string a total of w characters wide.
   * This will add w minus the number of characters in n (w - n.length) number of zeros or
   * just return the number provided if n.length >= w
   *
   * Examples:
   *   pad(1,2) ==> "01"
   *   pad(100, 4) ==> "0100"
   * @param n
   * @param w
   */
  function pad(n, w) {
    const number = n + '';
    return (number.length >= w) ? number : new Array(w  - number.length + 1).join('0') + number;
  }

/**
 * Convert a string to a date using a format string
 * @param {string} formatString Format string using special characters to define placement of numbers
 * @param {Date} value Date to be converted to a string
 * @returns {string} Date converted to the specified format
 *
 * @todo Add the ability to escape special characters
 *
 * @example
 *
 *  dateStringFormatter('YYYY-MM-DD', '2020-10-28') => <Date>'2020-10-28T00:00:00'
 */
function dateStringFormatter(formatString, value) {
  if (!value) {
    return new Date();
  }
  const parts = {
    Y: [],
    M: [],
    D: [],
    H: [],
    m: [],
    S: [],
    s: [],
  };

  const formatParts = formatString.split("") || [];

  formatParts.forEach((char, index) => {
    // Skip non-keyed chars
    if (!parts[char]) {
      return;
    }

    // Add character to the identified value list;
    parts[char].push(value[index]);
  });

  return new Date(
    parts.Y.length > 0 ? parseInt(parts.Y.join(""), 10) : 0,
    parts.M.length > 0 ? parseInt(parts.M.join(""), 10) - 1 : 0,
    parts.D.length > 0 ? parseInt(parts.D.join(""), 10) : 0,
    parts.H.length > 0 ? parseInt(parts.H.join(""), 10) : 0,
    parts.m.length > 0 ? parseInt(parts.m.join(""), 10) : 0,
    parts.S.length > 0 ? parseInt(parts.S.join(""), 10) : 0,
    parts.s.length > 0 ? parseInt(parts.s.join(""), 10) : 0
  );
}

function convertDateToFormat(formatString, value) {
  // EX: Date Input Output(2020-01-01) => YYYYMMDD(20200101);
  const dateParts = {
    Y: value.getFullYear().toString().split(''),
    M: pad((value.getMonth() + 1), 2).split(''),
    D: pad(value.getDate(), 2).split(''),
    H: pad(value.getHours(), 2).split(''),
    m: pad(value.getMinutes(), 2).split(''),
    S: value.getMilliseconds().toString().split(''),
    s: pad(value.getSeconds(), 2).split('')
  };

  // Iterate over format string and apply values
  let counter = 0;
  let currentChar = '';
  const output = formatString.split('').map((char) => {
    let result = char;
    if (!dateParts[char]) {
      return result;
    }

    if (currentChar === char) {
      result = dateParts[char][counter];
      counter++;
    } else {
      counter = 0;
    }

    currentChar = char;
    return dateParts[char][counter];
  });

  return output.join('');
}

module.exports = {
  convertDateToFormat,
  convertStringToDate: dateStringFormatter
}