const fs = require('fs');

const { MigrationError } = require('./error');

// @see: https://loopback.io/doc/en/lb3/Using-database-transactions.html#overview
const connectorsSupportingTransactions = [
    'mysql',
    'postgresql',
    'mssql',
    'oracle',
];

module.exports = class Task {

    get runAlways() {
        return this.options.runAlways === true;
    }

    constructor({identifier, version = '1.0.0', options = {} }) {
        this.identifier = identifier;
        this.version = version;
        this.options = options;
    }

    async run(dependencies, previousResult) {
        throw new MigrationError('Task:#run() not implemented');
    }

    async ensureDependencies(container, dependencyNames = this._getDependencies()) {
        for (const name of dependencyNames) {
            if (!Object.prototype.hasOwnProperty.call(container, name)) {
                throw new MigrationError(`Unmet depencency ${name} in dependency container`);
            }
        }
    }

    _getDependencies(){
        return [ 'MigrationModel' ];
    }

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

    async execute(statement, { MigrationModel, transaction }, params = [], options = {}) {
        if(transaction) {
            const opts = Object.assign({}, options, { transaction });
            return this.executeSQL(statement, transaction.connector, params, opts);
        }
        return this.executeSQL(statement, MigrationModel.getConnector(), params, options);
    }

    async executeSQL(statement, connector, params = [], options = {}){
        return new Promise((resolve, reject) => {
            connector.executeSQL(statement, params, options, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    connectorSupportsTransaction(connector) {
        return connectorsSupportingTransactions.indexOf(connector.name) !== -1;
    }
};
