const path = require('path');

const Task = require('../../Task');

module.exports = class DropMigrationTable extends Task {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        super({identifier: 'Postgres:DropMigrationTable', version, options: opts});
    }

    async run(dependencies) {
        const filePath = path.resolve(__dirname, './dropMigrationTable.sql');
        const statement = await this.readFile(filePath);
        const { params } = this.options;

        return this.execute(statement, dependencies, params);
    }
};
