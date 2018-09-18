const { expect } = require('chai');
const { describe, before, it } = require('mocha');

describe('Examples', function() {

    before('drop migration table', function() {
        // we cannot delete or truncate the migration table since it should not exist yet!
        const MigrationModel = this.service.app.models.Migration;
        const { DropMigrationTable } = this.service.app.get('jb-migration').tasks.postgres;
        const dropTableTask = new DropMigrationTable();
        return dropTableTask.run({ MigrationModel });
    });

    it('allows you to create a migration table for postgres', async function() {
        const app = this.service.app;
        const migration = this.service.app.get('jb-migration');

        const { CreateMigrationTable } = migration.tasks.postgres;

        const task = new CreateMigrationTable({ options: { params: [] }});
        const migTask = new migration.MigrationTask(task);
        const queue = new migration.MigrationQueue(
            [
                migTask,
            ],
            {
                migrationModelName: 'Migration',
                transactionConfig: {},
            },
        );
        await queue.run({app});
        const migrations = await this.service.app.models.Migration.find();
        expect(migrations).to.have.length(1);
    });
});