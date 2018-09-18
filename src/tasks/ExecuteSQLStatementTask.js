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
        const statement = await this.getStatement(dependencies);
        return this.execute(statement, dependencies, params);
    }

    getSchema(MigrationModel) {
        return MigrationModel.dataSource.connector.schema(MigrationModel.modelName);
    }

    async getStatement() {
        return this.statement
            || this.readFile(this.filePath);
    }
};
