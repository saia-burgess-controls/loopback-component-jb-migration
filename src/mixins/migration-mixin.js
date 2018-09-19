const defaultProperties = {
    id: {
        type: 'number',
        id: true,
        generated: true,
    },
    started: {
        type: 'date',
        required: true,
    },
    identifier: {
        type: 'string',
        required: true,
    },
    succeeded: {
        type: 'date',
        default: null,
    },
    failed: {
        type: 'date',
        default: null,
    },
    result: {
        type: 'string',
        default: null,
    },
};
/**
 * Loopback Mixin that adds the necessary method for a MigrationModel.
 *
 * @param Model
 */
module.exports = function(Model) {

    Object
        .entries(defaultProperties)
        .forEach(([propertyName, propertyDefinition]) => {
            Model.defineProperty(propertyName, propertyDefinition)
        });

    /**
     * Creates a migration instance.
     *
     * @param Task
     * @return {Promise.<*>}
     */
    Model.startTask = async function(task, transaction = null) {
        const { identifier } = task;
        const migrationData = {
            started: new Date(),
            identifier,
        };
        return new Model(migrationData);
    };

    /**
     * Determines if a task was already executed successfully by trying to load an
     * entry with the specific identifier from the database.
     *
     * Use the runAlways property of your concrete example to bypass this behavior, i.e. when
     * executing scripts that should be executed every time and implement their own guards that
     * prevent them from causing a corrupted state.
     *
     * @param task
     * @param transaction
     * @return {Promise<boolean>}
     */
    Model.taskRanSuccessfully = async function(task, transaction = null) {
        const { identifier, runAlways } = task;
        if (runAlways === true) {
            return false;
        }
        const params = {
            where: {
                identifier,
                succeeded: {
                    neq: null,
                },
            },
        };
        const result = await Model.findOne(params, {transaction});
        return !!result;
    };

    /**
     * Persist the result of the task as a migration instance.
     *
     * @param result
     * @param error
     * @param transaction
     * @return {Promise<void>}
     */
    Model.prototype.stopTask = async function(result = {}, error = null, transaction = null) {
        const stopped = new Date();
        if (error) {
            this.failed = stopped;
            this.result = JSON.stringify(error);
        } else {
            this.succeeded = stopped;
            this.result = JSON.stringify(result);
        }
        return this.save({ transaction });
    };
};
