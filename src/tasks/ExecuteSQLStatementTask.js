const Task = require('../Task');

module.exports = class ExecuteSQLStatementTask extends Task {

    constructor({
        identifier,
        version,
        filePath,
        statement,
        options = {},
    }) {
        super({ identifier, version, options});
        this.filePath = filePath;
        this.statement = statement;
    }

    async run(dependencies) {
        const { params } = this.options;
        const statement = this.statement || await this.readFile(this.filePath);
        return this.execute(statement, dependencies, params);
    }
};
