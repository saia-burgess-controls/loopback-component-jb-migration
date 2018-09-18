const path = require('path');

const { expect } = require('chai');

const Task = require('../../src/Task');

describe('The Task Class', () => {

    beforeEach(function() {
        const identifier = 'test-task';
        const version = '1.0.0';
        const options = { testing: true };

        this.identifier = identifier;
        this.version = version;
        this.options = options;

        this.task = new Task({ identifier, version, options });
    });

    it('can be instantiated with an object having an identifier a version and options', function() {
        expect(this.task).to.have.property('identifier', this.identifier);
        expect(this.task).to.have.property('version', this.version);
        expect(this.task).to.have.property('options').that.deep.equals(this.options);
    });

    it('accepts a `runAlways` option which is false by default and marks tasks that can be ' +
        'safely performed multiple times', function() {
        expect(this.task.runAlways).to.be.false;

        const runAlwaysTask = new Task({
            identifier: 'runs',
            options: {
                runAlways: true,
            },
        });

        expect(runAlwaysTask.runAlways).to.be.true;
    });

    it('#run: is not implemented', async function() {
        try {
            await this.task.run({});
            return Promise.reject(new Error('Run should not be implemented and throw an error'));
        } catch (error) {
            expect(error).to.have.property('message').that.includes('not implemented');
        }
    });

    describe('Task.ensureDependencies(obj, depencencies = this._getDepencencies())', () => {

        it('resolves if all dependencies are present', async function() {
            const dependencies = { test: true, dep: {} };
            await this.task.ensureDependencies(dependencies, ['test', 'dep']);
        });

        it('fails if not all dependencies are present', async function() {
            const dependencies = { test: true };
            try {
                await this.task.ensureDependencies(dependencies, ['test', 'dep']);
                return Promise.reject(new Error('Unmet dependencies should result in an error.'));
            } catch (error) {
                expect(error).to.have.property('message').that.includes('dep');
            }
        });

        it('requires the "MigrationModel" by default', async function() {
            const dependencies = {};
            try {
                await this.task.ensureDependencies(dependencies);
                return Promise.reject(new Error('Unmet dependencies should result in an error.'));
            } catch (error) {
                expect(error).to.have.property('message').that.includes('MigrationModel');
            }
        });
    });

    describe('Task.connectorSupportsTransaction(connector)', () => {

        it('checks if the passed connector supports transactions', function() {
            expect(this.task.connectorSupportsTransaction({ name: 'postgresql' })).to.be.true;
            expect(this.task.connectorSupportsTransaction({ name: 'memory' })).to.be.false;
        });

    });

    describe('Task.executeSQL(statement, connector, params = [], options = {})', function(){

        it('passes an sql query to the connector and wraps it into a promise', async function() {

            const state = "SELECT * FROM table1";
            const pars = [];
            const opts = {};
            const res = {};

            const connector = {
                executeSQL(statement, params, options, callback) {
                    try {
                        expect(statement).to.be.equal(state);
                        expect(pars).to.be.equal(params);
                        expect(opts).to.be.equal(options);
                        callback(null, res);
                    } catch (err) {
                        callback(err);
                    }
                },
            };

            const task = new Task({identifier: 'Testoni'});
            const result = await task.executeSQL(state, connector, pars, opts);
            expect(result).to.be.equal(res);
        });

    });

    describe('Task.execute(statement, { MigrationModel, transaction }, params = [], options = {})',
        function(){

            it('Executes an sql query through the connector given by the transaction ' +
                '(passing the transaction)', async function() {

                const state = "SELECT * FROM table1";
                const pars = [];
                const opts = {};
                const res = {};

                const connector = {
                    executeSQL(statement, params, options, callback) {
                        try {
                            expect(statement).to.be.equal(state);
                            expect(pars).to.be.equal(params);
                            expect(options).to.have.property('transaction', transaction);
                            callback(null, res);
                        } catch (err) {
                            callback(err);
                        }
                    },
                };
                const MigrationModel = {};
                const transaction = {
                    connectorAccess: 0,
                    get connector() {
                        transaction.connectorAccess += 1;
                        return connector;
                    },
                };

                const task = new Task({identifier: 'Testoni'});
                const result = await task.execute(state, {
                    MigrationModel,
                    transaction,
                }, pars, opts);

                expect(result).to.be.equal(res);
                expect(transaction.connectorAccess).to.be.equal(1);
            });

            it('Executes an sql query through the connector given by the MigrationModel if no ' +
                'transaction is given ', async function() {

                const state = "SELECT * FROM table1";
                const pars = [];
                const opts = {};
                const res = {};

                const connector = {
                    executeSQL(statement, params, options, callback) {
                        try {
                            expect(statement).to.be.equal(state);
                            expect(pars).to.be.equal(params);
                            expect(options).to.not.have.property('transaction');
                            callback(null, res);
                        } catch (err) {
                            callback(err);
                        }
                    },
                };
                const MigrationModel = {
                    connectorAccess: 0,
                    getConnector() {
                        MigrationModel.connectorAccess += 1;
                        return connector;
                    },
                };

                const task = new Task({identifier: 'Testoni'});
                const result = await task.execute(state, {
                    MigrationModel
                }, pars, opts);

                expect(result).to.be.equal(res);
                expect(MigrationModel.connectorAccess).to.be.equal(1);
            });

        });

    it('#readFile: allows reading in a file (promisified)', async function() {
        const fullPath = path.resolve(__dirname, '../support/data/testfile.sql');
        const result = await this.task.readFile(fullPath);
        expect(result).to.be.equal('CREATE TABLE test;');
    });
});
