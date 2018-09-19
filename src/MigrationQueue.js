const { MigrationError } = require('./error/index.js');

/**
 * Queue that runs the passed tasks in the given order.
 *
 * The queue
 *   1. resolves the migration model (which is used to determine the datasource)
 *   2. creates a transaction on the datasource if configured accordingly
 *   3. runs one task after the other and hands over the result to the next one
 *   4. commits the transaction (if present) or roles it back on failure
 *
 * @note: in future versions a MigrationQueue should fulfill the task interface
 */
module.exports = class MigrationQueue {

    /**
     * Determine if the queue should open up a transaction.
     *
     * @return {boolean}
     */
    get requiresTransaction() {
        return this.transactionConfig !== null;
    }

    constructor(tasks, { migrationModelName = 'Migration', transactionConfig = null }) {
        this.tasks = tasks;
        this.transactionConfig = transactionConfig;
        this.migrationModelName = migrationModelName;
    }

    /**
     * Runs all tasks (see task interface)
     *
     * @param { app }
     * @return {Promise<*|void>}
     */
    async run(dependencies) {
        const deps = await this.setupDependencies(dependencies);
        return this.runTasks(deps);

    }

    /**
     * Iterate over all tasks and execute them.
     *
     * @param MigrationModel
     * @param transaction
     * @return {Promise<*>}
     */
    async runTasks({ MigrationModel, transaction }) {
        try {
            let previousResult = null;
            for (const task of this.tasks) {
                previousResult = await task.run({ MigrationModel, transaction }, previousResult);
            }
            if (transaction) {
                await transaction.commit();
            }
            return previousResult;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            const msg = `MigrationQueue failed with message: ${error.message}`;
            throw new MigrationError(msg, { originalError: error });
        }
    }

    /**
     * Sets up the dependencies for the queue (i.e. the MigrationModel and the transaction).
     *
     * Future versions might have a more sophisticted resolving and can check for missing
     * dependencies.
     *
     * @param app
     * @return {Promise<{MigrationModel: *, transaction: null}>}
     */
    async setupDependencies({ app }) {
        const MigrationModel = this.resolveMigrationModel(app);
        const transaction = this.requiresTransaction
            ? await MigrationModel.beginTransaction(this.transactionConfig)
            : null;

        return {
            MigrationModel,
            transaction,
        };
    }

    /**
     * Extracts the migration model from the app based on the configured migrationModelName.
     *
     * @param app
     * @return {*}
     */
    resolveMigrationModel(app) {
        if (!Object.prototype.hasOwnProperty.call(app.models, this.migrationModelName)) {
            throw new MigrationError(`MigrationModel "${this.migrationModelName}" does not exist`);
        }

        return app.models[this.migrationModelName];
    }

};
