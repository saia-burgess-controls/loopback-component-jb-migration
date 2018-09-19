const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask.js');

/**
 * Task to drop the migration table in a postgres datasource.
 *
 * Mainly used for testing.
 */
module.exports = class DropMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });;
        super({
            identifier: 'Postgres:DropMigrationTable',
            options: opts,
            version,
        });
    }

    /**
     * Returns the statement to drop the table.
     *
     * @param MigrationModel
     * @return {Promise<string>}
     */
    async getStatement({ MigrationModel }){
        const schema = this.getSchema(MigrationModel);
        const table = this.getTable(MigrationModel);
        return `DROP TABLE IF EXISTS "${schema}"."${table}";`;
    }
};
