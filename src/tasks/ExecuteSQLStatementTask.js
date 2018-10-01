const Task = require('../Task.js');

/**
 * Allows executing an sql statement either specified by an absolute filePath or the statement as
 * a string. This task can be used to execute statements without implementing concrete tasks.
 */
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

    /**
     * Returns the schema of a model.
     *
     * @param MigrationModel
     * @return {*}
     */
    getSchema(MigrationModel) {
        return MigrationModel.dataSource.connector.schema(MigrationModel.modelName);
    }

    /**
     * Returns the table a model is stored in.
     *
     * @param MigrationModel
     * @return {*}
     */
    getTable(MigrationModel) {
        return MigrationModel.dataSource.connector.table(MigrationModel.modelName);
    }

    /**
     * Returns the sql statement to be executed on the datasource as a string.
     *
     * This method can be overriden by subclasses for more complex query building.
     *
     * @return Promise<String>
     */
    async getStatement() {
        return this.statement
            || this.readFile(this.filePath);
    }
};
