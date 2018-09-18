const { MigrationError } = require('./error');

/**
 * Basic queue to process migration tasks.
 */
module.exports = class MigrationQueue {

    get requiresTransaction() {
        return this.transactionConfig !== null;
    }

    constructor(tasks, { migrationModelName = 'Migration', transactionConfig = null }) {
        this.tasks = tasks;
        this.transactionConfig = transactionConfig;
        this.migrationModelName = migrationModelName;
    }

    async run(dependencies) {
        const deps = await this.setupDependencies(dependencies);
        return this.runTasks(deps);

    }

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

    resolveMigrationModel(app) {
        if (!Object.prototype.hasOwnProperty.call(app.models, this.migrationModelName)) {
            throw new MigrationError(`MigrationModel "${this.migrationModelName}" does not exist`);
        }

        return app.models[this.migrationModelName];
    }

};
