const { runCli } = require("./lib/process");
const structure = {
    api: {
        get: (id) => {
            console.log(id)
        }
    },
    utils: {
        func1: (arg1, arg2) => {
            console.log(`func1 ${arg1} ${arg2}`)
        },
        func2: (arg1, arg2) => {
            console.log(`func2 ${arg1} ${arg2}`)
        }
    }
};

runCli(structure);