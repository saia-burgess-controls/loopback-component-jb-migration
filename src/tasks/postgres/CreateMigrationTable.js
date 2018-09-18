const path = require('path');

const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask');

module.exports = class CreateMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        super({
            identifier: 'Postgres:CreateMigrationTable',
            options: opts,
            version,
        });
    }

    async getStatement({ MigrationModel }) {
        const schema = this.getSchema(MigrationModel);
        return `
          CREATE TABLE IF NOT EXISTS "${schema}"."Migration" (
              id SERIAL PRIMARY KEY,
              identifier VARCHAR(100) NOT NULL,
              started    TIMESTAMP    NOT NULL,
              succeeded  TIMESTAMP DEFAULT NULL,
              failed     TIMESTAMP DEFAULT NULL,
              result     JSON      DEFAULT NULL
          );`;
    }
};
