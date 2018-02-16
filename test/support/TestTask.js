const Task = require('../../src/Task');

module.exports = class TestTask extends Task {

    constructor(name, version){
        super(name, version);
        this.invocationCount = 0;
    }

    async run(dependencies, previousResult){
        this.invocationCount = this.invocationCount + 1;
        return {
            data: 'testdata'
        };
    }
};
