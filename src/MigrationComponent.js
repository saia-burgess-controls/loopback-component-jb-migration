const MigrationTask = require('./MigrationTask');
const MigrationQueue = require('./MigrationQueue');
const Task = require('./Task');
const tasks = require('./tasks');

/**
 * Wrapper for the migration functionality.
 *
 * Future versions should have convenience methods to create queues and be able to read
 * configuration.
 *
 * @type {module.MigrationComponent}
 */

module.exports = class MigrationComponent {
    constructor(options) {
        this.options = options;
        this.MigrationTask = MigrationTask;
        this.MigrationQueue = MigrationQueue;
        this.Task = Task;
        this.tasks = tasks;
    }
};

module.exports.MigrationQueue = MigrationQueue;
module.exports.MigrationTask = MigrationTask;
module.exports.Task = Task;
module.exports.tasks = tasks;