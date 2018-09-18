const path = require('path');

const ExecuteSQLStatementTask = require('../ExecuteSQLStatementTask');

module.exports = class DropMigrationTable extends ExecuteSQLStatementTask {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        const filePath = path.resolve(__dirname, './dropMigrationTable.sql');
        super({
            filePath,
            identifier: 'Postgres:DropMigrationTable',
            options: opts,
            version,
        });
    }
};
