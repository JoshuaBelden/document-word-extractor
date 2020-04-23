/**
 * This program is used to extract out words that need to be studied from a given article of language text.
 * Given an input file, this program will read the text, remove special characters that are not important,
 * remove all words that are already known, and save a sorted list of unique words that are left over.
 * 
 * Background: I'm studying Spanish and wanted an easy way to extract words from a spanish document, article, or pdf
 *  that I need to study. I can copy the article, paste it into `input.txt`, run the program, and use `output.txt` to
 *  build flashcards. The `special-chars.txt` file can be ammended to if the document you use has weird characters that
 *  need to be removed. I use `ignored-words.txt` to remove things like names or misspellings in the article you want to
 *  ignore. The reason those ignored words don't go into `known-words.txt` is because I want that file to only include
 *  the words I know from the language I'm study, in this case spanish.
 * 
 * Program expects the following in the root of the file:
 * - input.txt: Contains the article of text to parse.
 * - special-chars.txt: Contains characters that you want removed from the article first. No new-lines or delimiters.
 * - ignored-words.txt: Contains a list of words that you want ignored. One word per line, all lower-case.
 * - known-words.txt: Contains a list of words that you already know. One word per line, all lower-case.
 * 
 * To run the program in node, use the following commands.
 * 
 * npm install
 * npm run start
 * 
 * There is no fancy error handling.
 */

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