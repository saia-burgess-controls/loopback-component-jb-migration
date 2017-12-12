const { expect } = require('chai');

const { MigrationError } = require('../../src/error');
const TestTask = require('../support/TestTask');
const MigrationTask = require('../../src/MigrationTask');

describe('The MigrationTask Class', function(){

    it('can be instantiated with a task it delegates to', function(){
        const task = new TestTask();
        const migTask = new MigrationTask(task);
    });

    it('depends on a booted service exposing the models, ' +
        'fails if not passed as a dependency with a dedicated error', function(){
        const task = new TestTask();
        const migTask = new MigrationTask(task);

        return expect(migTask.run({})).to.eventually.be.rejectedWith(MigrationError);
    });
});