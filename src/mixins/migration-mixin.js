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
