const path = require('path');

const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask');

module.exports = class DropMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });;
        super({
            identifier: 'Postgres:DropMigrationTable',
            options: opts,
            version,
        });
    }

    async getStatement({ MigrationModel }){
        const schema = this.getSchema(MigrationModel);
        const table = this.getTable(MigrationModel);
        return `DROP TABLE IF EXISTS "${schema}"."${table}";`;
    }
};
