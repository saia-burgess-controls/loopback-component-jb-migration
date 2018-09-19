const fs = require('fs');

const { MigrationError } = require('./error/index.js');

// @see: https://loopback.io/doc/en/lb3/Using-database-transactions.html#overview
const connectorsSupportingTransactions = [
    'mysql',
    'postgresql',
    'mssql',
    'oracle',
];


/**
 * The basic interface for all our tasks. A task encapsules a concrete procedure within its generic
 * run method.
 *
 * @type {module.Task}
 */
module.exports = class Task {

    /**
     * Determine if the task can safely run multiple times.
     * @return {boolean}
     */
    get runAlways() {
        return this.options.runAlways === true;
    }

    constructor({ identifier, version = '1.0.0', options = {} }) {
        this.identifier = identifier;
        this.version = version;
        this.options = options;
    }

    /**
     * Method to execute the concrete task.
     *
     * The interface is as generic as possible so we can easily extend it in future versions or
     * by configuration.
     *
     * @param dependencies an object containing references to parts of applications it depends on.
     * @param previousResult the result of a previously executed task
     * @return {Promise<void>}
     */
    async run(dependencies, previousResult = null) {
        const message = 'Task:#run() not implemented, please override it in your concrete task (e.g. a subclass of this task)';
        throw new MigrationError(message);
    }

    /**
     * Ensure that all dependencies are present in the passed object by checking for the keys passed
     * in the optional dependencyNames parameter (defaults to the result of the _getDependencies)
     * method.
     *
     * It is up to your concrete task to ensure that all the necessary dependencies are passed.
     *
     * This was initially intended to keep the interface generic without losing control over the
     * necessary dependencies.
     *
     * @param dependencyObject
     * @param dependencyNames Array
     * @return {Promise<void>}
     */
    async ensureDependencies(dependencyObject, dependencyNames = this._getDependencies()) {
        for (const name of dependencyNames) {
            if (!Object.prototype.hasOwnProperty.call(dependencyObject, name)) {
                const { identifier } = this;
                const message = `Unmet depencency ${name} in dependency container, required by task ${identifier}`;
                throw new MigrationError(message);
            }
        }
    }

    /**
     * Returns an array containing the names of all dependencies. Can be overriden by subclasses.
     *
     * @return {string[]}
     * @private
     */
    _getDependencies() {
        return ['MigrationModel'];
    }

    /**
     * Read in files in a promisified way.
     *
     * @param path
     * @param encoding
     * @return {Promise<any>}
     */
    async readFile(path, encoding = 'utf8') {
        return new Promise((resolve, reject) => {
            fs.readFile(path, encoding, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    /**
     * Executes an sql statement and based on the migration model and an optional transaction.
     *
     * This is a convenience method that adapts between our migration interfaces and Loopback's
     * internals.
     *
     * @param statement
     * @param MigrationModel
     * @param transaction
     * @param params
     * @param options
     * @return {Promise<*>}
     */
    async execute(statement, { MigrationModel, transaction }, params = [], options = {}) {
        if (transaction) {
            const opts = Object.assign({}, options, { transaction });
            return this.executeSQL(statement, transaction.connector, params, opts);
        }
        return this.executeSQL(statement, MigrationModel.getConnector(), params, options);
    }

    /**
     * Promisified method to execute sql statements on a concrete connector.
     *
     * @param statement
     * @param connector
     * @param params
     * @param options
     * @return {Promise<any>}
     */
    async executeSQL(statement, connector, params = [], options = {}) {
        return new Promise((resolve, reject) => {
            connector.executeSQL(statement, params, options, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    /**
     * Detect if the current connector supports transactions.
     *
     * @param connector
     * @return {boolean}
     */
    connectorSupportsTransaction(connector) {
        return connectorsSupportingTransactions.indexOf(connector.name) !== -1;
    }
};
