"use strict";

const { traverse } = require('./utils/traverse');
const { runAutoComplete, runForm, runSelect } = require('./utils/prompts');
const { getArgNames } = require('./utils/functions');

async function findFunction(structure) {
    let generator = traverse(structure);
    let { value: choice, done } = generator.next();

    while(!done) {
        const input = await runAutoComplete('path', 'Select path', 10, choice);
        ({ value: choice, done } = generator.next(input));
    }

    return choice;
}

async function prepareArgs(func) {
    const choices = getArgNames(func);
    return await runForm('args', 'Enter function args', choices, '');
}

async function run(structure) {
    const func = await findFunction(structure);
    const args = await prepareArgs(func);
    return await func(...Object.values(args));
}

module.exports = {
    findFunction,
    prepareArgs,
    run
};