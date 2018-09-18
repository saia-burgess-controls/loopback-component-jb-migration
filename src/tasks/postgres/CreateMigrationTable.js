const path = require('path');

const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask');

module.exports = class CreateMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        const filePath = path.resolve(__dirname, './createMigrationTable.sql');
        super({
            filePath,
            identifier: 'Postgres:CreateMigrationModel',
            options: opts,
            version,
        });
    }
};
