const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask.js');

/**
 * Task to create the table of the migration model in a postgres datasource as required by the
 * MigrationMixin.
 *
 * @see src/mixins/MigrationMixin.js
 */
module.exports = class CreateMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        super({
            identifier: 'Postgres:CreateMigrationTable',
            options: opts,
            version,
        });
    }

    /**
     * Returns the create table statement respecting the schema and the configured table of
     * the MigrationModel.
     *
     * @override
     * @param MigrationModel
     * @return {Promise<string>}
     */
    async getStatement({ MigrationModel }) {
        const schema = this.getSchema(MigrationModel);
        const table = this.getTable(MigrationModel);
        return `
          CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (
              id SERIAL PRIMARY KEY,
              identifier VARCHAR(100) NOT NULL,
              started    TIMESTAMP    NOT NULL,
              succeeded  TIMESTAMP DEFAULT NULL,
              failed     TIMESTAMP DEFAULT NULL,
              result     JSON      DEFAULT NULL
          );`;
    }
};
