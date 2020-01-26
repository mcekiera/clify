"use strict";
const RegExps = {
    FUNCT_ARG: /(^function\s.*?|^)\(([^)]*)\)/,
    INLINE_COMMENT: /\/\*.*\*\//,
    REST_ARGS_OPERATOR: /^[.]{3}/,
    DEFAULT_ARG_VALUE: /\s*=\s*.*$/
};

function getArgNames(func) {
    const argsStr = func.toString().match(RegExps.FUNCT_ARG);
    if(argsStr) {
        const args = argsStr[2];

        return args.split(',').map(function (arg) {
            return arg.trim()
                .replace(RegExps.INLINE_COMMENT, '')
                .replace(RegExps.REST_ARGS_OPERATOR, '')
                .replace(RegExps.DEFAULT_ARG_VALUE, '');
        }).filter(function (arg) {
            return arg;
        });
    } else {
        return [];
    }
}

module.exports = {
    getArgNames
};