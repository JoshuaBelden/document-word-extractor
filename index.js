const fs = require('fs');
const util = require('util');

const INPUT_FILE_PATH = 'input.txt';
const SPECIAL_CHARACTER_FILE_PATH = 'special-chars.txt';
const IGNORED_WORDS_FILE_PATH = 'ignored-words.txt';
const KNOWN_WORDS_FILE_PATH = 'known-words.txt';

// Wrap the built-in file system methods in a Promise.
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

/**
 * @function readTextAsync
 * @description Asyncronously reads all text from a file.
 * @param {path} path Path to the file to read from.
 * @returns A promise containing the result.
 */
const readTextAsync = async (path) => await readFileAsync(path, 'utf8');

/**
 * @function writeTextAsync
 * @description Asyncrounously writes all specified text to a file.
 * @param {path} path Path to the file to write to.
 * @returns A promise containing the result.
 */
const writeTextAsync = async (path, text) => await writeFileAsync(path, text);

/**
 * @function getSpecialCharacters
 * @description Asyncrounously reads special characters from a source file.
 * @param {path} path Path to the file to read from.
 * @returns A promise containing an array of single characters.
 */
const getSpecialCharacters = async (path) => (await readTextAsync(path)).split('');

/**
 * @function getListOfWords
 * @description Asyncrounously reads a list of words from a source file.
 * @param {path} path Path to the file to read from.
 * @returns A promise containing an array of words found in the file.
 */
const getListOfWords = async path => (await readTextAsync(path)).split('\n');

/**
 * @function flattenText
 * @description Converts a document of text by putting each word on its own line.
 * @param {input} input Text full of words that needs to be split up.
 * @returns A promise containing an array of words found in the file.
 */
const flattenText = input => input.replace(/ /g, '\n');

/**
 * @function escapeExpression
 * @description Finds the characters in the specified expression that need to be
 *  escaped and escapes them.
 * @param {expression} expression Expression to escape.
 * @returns A string of the escaped expression.
 */
const escapeExpression = expression => expression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @function buildRegEx
 * @description Builds a RegEx object from the given expression.
 * @param {expression} expression Expression to build the RegEx from.
 * @returns A RegEx option that uses the given expression globaly.
 */
const buildRegEx = expression => new RegExp(escapeExpression(expression), 'g');

/**
 * @function removeCharacters
 * @description Removes all instances of the characters specified from the given text.
 * @param {text} text Text to remove characters from.
 * @param {chars} chars Array of characters to remove from the text.
 * @returns A string full of the original text, but with special characters removed.
 */
const removeCharacters = (text, chars) => {
    chars.forEach(char => text = text.replace(buildRegEx(char), ''));
    return text;
};

/**
 * @function removeWords
 * @description Removes all entries in the specified array that match any words.
 * @param {array} words Array of words.
 * @param {words} wordsToRemove Array of words to be removed.
 * @returns An array built from the original array, but without the specified words.
 */
const removeWords = (words, wordsToRemove) => words.filter(word => !wordsToRemove.includes(word));

/**
 * @function main
 */
const main = async () => {

    console.log('Process started...');
    const specialChars = await getSpecialCharacters(SPECIAL_CHARACTER_FILE_PATH);
    const ignoredWords = await getListOfWords(IGNORED_WORDS_FILE_PATH);
    const knownWords = await getListOfWords(KNOWN_WORDS_FILE_PATH);

    // Do work on the text as a whole.
    console.log('...reading input');
    let inputText = await readTextAsync(INPUT_FILE_PATH);

    console.log('...flattening input');
    inputText = flattenText(inputText);

    console.log('...lower-casing input');
    inputText = inputText.toLowerCase();

    console.log('...removing invalid characters');
    inputText = removeCharacters(inputText, specialChars);

    // Do work on individual lines.
    let inputLines = inputText.split('\n').filter(line => line !== '');

    console.log('...sorting input');
    inputLines = inputLines.sort();

    console.log('...removing duplicates');
    inputLines = [...new Set(inputLines)];

    console.log('...removing ignored words');
    inputLines = removeWords(inputLines, ignoredWords);

    console.log('...removing known words');
    inputLines = removeWords(inputLines, knownWords);

    // Re-establish the text and output
    console.log('...writing output');
    const outputText = inputLines.join('\n');
    await writeTextAsync('output.txt', outputText);

    console.log('Process ended.');
};

main();