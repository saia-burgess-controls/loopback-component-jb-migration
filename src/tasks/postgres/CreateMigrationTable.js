const path = require('path');

const Task = require('../../Task');

module.exports = class CreateMigrationTable extends Task {

    constructor({ version, options = {}} = {}) {
        const opts = Object.assign({}, options, { runAlways: true });
        super({identifier: 'Postgres:CreateMigrationModel', version, options: opts});
    }

    async run(dependencies) {
        const filePath = path.resolve(__dirname, './createMigrationTable.sql');
        const statement = await this.readFile(filePath);
        const { params } = this.options;

        return this.execute(statement, dependencies, params);
    }
};
