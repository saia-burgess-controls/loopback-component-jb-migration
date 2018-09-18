const Task = require('./Task');

/**
 * @type {module.MigrationTask}
 */

module.exports = class MigrationTask extends Task {

    constructor(task) {
        const identifier = `Migration:${task.identifier}`;
        const { version, options } = task;
        super({identifier, version, options});

        this.task = task;
    }

    /**
     * @param app
     * @return {Promise.<*>}
     */
    async run({ MigrationModel, transaction }) {

        const ranSuccessfully = await MigrationModel.taskRanSuccessfully(this.task, transaction);

        if (ranSuccessfully) {
            return null;
        }

        const migration = await MigrationModel.startTask(this.task, transaction);

        try {
            const result = await this.task.run({ MigrationModel, transaction });
            return this.finalizeMigration(migration, result, null, transaction);
        } catch (err) {
            return this.finalizeMigration(migration, null, err, transaction);
        }
    }

    async finalizeMigration(migration, result = null, error = null, transaction) {
        if (migration) {
            await migration.stopTask(result, error, transaction);
        }
        if (error) {
            return Promise.reject(error);
        }
        return result;
    }
};
