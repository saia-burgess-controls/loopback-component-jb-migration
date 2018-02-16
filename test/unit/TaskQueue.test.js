const { expect } = require('chai');

const TaskQueue = require('../../src/TaskQueue');

describe('The TaskQueue Class', function() {

    beforeEach(function() {
        this.dependencies = {};
        this.name = 'test-task';
        this.version = '1.0.0';
        const task = {
            name: this.name,
            version: this.version,
            runCalled: 0,
            revertCalled: 0,
            run(deps){
                task.runCalled = task.runCalled + 1;
                return Promise.resolve();
            },
            revert(){
                task.revertCalled = task.revertCalled + 1;
                return Promise.resolve();
            },
        };
        this.task = task;
        this.taskQueue = new TaskQueue('TestQueue', '1.0.0', [ this.task ]);
    });

    it('can be instantiated with a collection of tasks', function() {
        expect(this.taskQueue).to.have.property('tasks').that.has.length(1);
    });

    it('#run: calls the run method of the passed tasks', function() {
        return this.taskQueue
            .run(this.dependencies)
            .then(() => {
                expect(this.task.runCalled).to.equal(1);
            });
    });

    it('#revert: calls the revert method of the passed tasks', function() {
        return this.taskQueue
            .revert(this.dependencies)
            .then(() => {
                expect(this.task.revertCalled).to.equal(1);
            });
    });
});
