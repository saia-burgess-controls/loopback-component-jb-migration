const { expect } = require('chai');

const Task = require('../../src/Task');

describe('The Task Class', () => {

    beforeEach(function() {
        this.name = 'test-task';
        this.version = '1.0.0';
        this.task = new Task(this.name, this.version);
    });

    it('can be instantiated with a name and a version', function() {
        expect(this.task).to.have.property('name', this.name);
        expect(this.task).to.have.property('version', this.version);
    });

    it('#run: is not implemented', function() {
        return expect(this.task.run({})).to.eventually.be.rejected;
    });

    it('#revert: is not implemented', function() {
        return expect(this.task.revert({})).to.eventually.be.rejected;
    });

    it('#ensureDependencies: resolves if all dependencies are present', function() {
        const dependencies = { test: true, dep: {} };
        return expect(this.task.ensureDependencies(dependencies, ['test', 'dep']))
            .to.eventually.be.fulfilled;
    });

    it('#ensureDependencies: fails if not all dependencies are present', function() {
        const dependencies = { test: true };
        return expect(this.task.ensureDependencies(dependencies, ['test', 'dep']))
            .to.eventually.be.rejected;
    });
});
