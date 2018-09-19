const { MigrationError } = require('./error/index.js');
const Task = require('./Task.js');

/**
 * Extended task class that delegates to a concrete task.
 *
 * The MigrationTask uses the MigrationModel to determine if a task did already run and persists
 * the result of a task as an instance of the MigrationModel i.e. in the database.
 *
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
     * Runs the delegate task if it was not successfully executed before.
     *
     * @param { MigrationModel, transaction}
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
            const msg = `MigrationTask ${this.identifier} failed with message: ${err.message}`;
            const error = new MigrationError(msg, { originalError: err });
            return this.finalizeMigration(migration, null, error, transaction);
        }
    }

    /**
     * Stores the result of the execution of the delegate task into the migration instance.
     *
     * @param migration
     * @param result
     * @param error
     * @param transaction
     * @return {Promise<*>}
     */
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
