"use strict";
const get = require('lodash/get');

const BACK_OPERATOR = '<';
const PATH_LAST_PART = /\.?[^.]+$/;

function* traverse(structure) {
    const base = structure;
    let pointer = base;
    let path = '';
    let inProgress = true;

    let input = yield Object.keys(base);

    while(inProgress) {
        if(input === BACK_OPERATOR) {
            path = path.replace(PATH_LAST_PART, '');
            pointer = get(base, path, base);

            if(!path) {
                input = yield Object.keys(pointer);
            } else {
                input = yield decorateWithBackOperator(pointer);
            }
        } else {
            pointer = pointer[input];
            path = `${path}${ path ? '.' : '' }${input}`;

            if(typeof pointer === 'function') {
                inProgress = false;
                return pointer;
            } else {
                input = yield decorateWithBackOperator(pointer);
            }
        }
    }
}

function decorateWithBackOperator(pointer) {
    const choice = Object.keys(pointer);
    choice.push(BACK_OPERATOR);
    return choice;
}

module.exports = {
    traverse
};