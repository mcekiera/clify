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

            if(!path) {
                pointer = base;
                input = yield Object.keys(pointer);
            } else {
                pointer = get(base, path, base);
                const choice = Object.keys(pointer);
                choice.push(BACK_OPERATOR);
                input = yield choice;
            }
        } else {
            pointer = pointer[input];
            path = `${path}${ path ? '.' : '' }${input}`;

            if(typeof pointer === 'function') {
                inProgress = false;
                return pointer;
            } else {
                const choice = Object.keys(pointer);
                choice.push(BACK_OPERATOR);
                input = yield choice;
            }
        }
    }
}

module.exports = {
    traverse
};