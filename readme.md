# Document Word Extractor

This program is used to extract out words that need to be studied from a given article of language text.
Given an input file, this program will read the text, remove special characters that are not important,
remove all words that are already known, and save a sorted list of unique words that are left over.

## Background

I'm studying Spanish and wanted an easy way to extract words from a spanish document, article, or pdf
that I need to study. I can copy the article, paste it into `input.txt`, run the program, and use `output.txt` to
build flashcards. The `special-chars.txt` file can be ammended to if the document you use has weird characters that
need to be removed. I use `ignored-words.txt` to remove things like names or misspellings in the article you want to
ignore. The reason those ignored words don't go into `known-words.txt` is because I want that file to only include
the words I know from the language I'm study, in this case spanish.

## Setup

Program expects the following in the root of the file:

- input.txt: Contains the article of text to parse.
- special-chars.txt: Contains characters that you want removed from the article first. No new-lines or delimiters.
- ignored-words.txt: Contains a list of words that you want ignored. One word per line, all lower-case.
- known-words.txt: Contains a list of words that you already know. One word per line, all lower-case.

## Execute

To run the program in node, use the following commands.

```
npm install
npm run start
```

## Warning

There is no fancy error handling, so things have to be setup correctly. Only `output.txt` is overwritten.
