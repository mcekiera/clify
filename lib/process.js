"use strict";

const { traverse } = require('./utils/traverse');
const { runAutoComplete, runForm, runSelect } = require('./utils/prompts');

async function findFunction(structure) {
    let generator = traverse(structure);
    let { value: choice, done } = generator.next();

    while(!done) {
        const input = await runAutoComplete('path', 'Select path', 10, choice);
        ({ value: choice, done } = generator.next(input));
    }

    return choice;
}

module.exports = {
    findFunction
};