const { expect } = require('chai')

const TestTask = require('../support/TestTask');
const MigrationTask = require('../../src/MigrationTask');

describe('The MigrationTask', function(){

    before(function(){
        this.Migration = this.service.app.models.Migration;
        this.dependencies = { app: this.service.app };
    });

    it('persists a migration after it ran', async function(){
        const task = new TestTask('Testrun', '0.1');
        const migTask = new MigrationTask(task);

        const result = await migTask.run(this.dependencies);

        const migration = await this.Migration.findOne({});

        expect(migration).to.have.property('identifier', 'Migration:Testrun');
        expect(migration).to.have.property('succeeded').that.is.a('Date');
        expect(migration).to.have.property('data').that.is.deep.equal({
            data: 'testdata'
        });
    });

    it('only runs once in the same version', async function(){
        const task = new TestTask('Testrun2', '0.1');
        const migTask = new MigrationTask(task);
        const migTask2 = new MigrationTask(task);

        await migTask.run(this.dependencies);
        await migTask2.run(this.dependencies);

        const migrations = await this.Migration.find({where:{identifier: 'Migration:Testrun2'}});

        expect(migrations).to.have.length(1);
        expect(task).to.have.property('invocationCount', 1);
    });

    it('runs twice in different versions', async function(){
        const task = new TestTask('Testrun3', '0.1');
        const task2 = new TestTask('Testrun3', '0.2');

        const migTask = new MigrationTask(task);
        const migTask2 = new MigrationTask(task2);

        await migTask.run(this.dependencies);
        await migTask2.run(this.dependencies);

        const migrations = await this.Migration.find({where:{identifier: 'Migration:Testrun3'}});

        expect(migrations).to.have.length(2);
        expect(task).to.have.property('invocationCount', 1);
        expect(task2).to.have.property('invocationCount', 1);
    });

    it('runs multiple times if the migration-task is set to rerun', async function(){
        const task = new TestTask('Testrun4', '0.1');

        const migTask = new MigrationTask(task);
        const migTask2 = new MigrationTask(task, true);

        await migTask.run(this.dependencies);
        await migTask2.run(this.dependencies);

        const migrations = await this.Migration.find({where:{identifier: 'Migration:Testrun4'}});
        expect(migrations).to.have.length(2);
        expect(task).to.have.property('invocationCount', 2);
    });


});