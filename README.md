# loopback-component-jb-migration

Migration component for loopback, providing data structures to perform migrations in Loopback
applications.

> **Note:** The code is in a really early stage, is barely tested *and only supports postgres*.
Since there's a high possibility that the interface will change, we decided to go for version 1
as a first version.

Basically you hook in the component using the `component-config.json`:

```Json
{
    "@joinbox/loopback-component-jb-migration": {
        "exposeAt": "migration"
    }
}
```

The `exposeAt` property defines where to expose the component ('jb-migration' by default). Currently
it has no methods on it and only provides access to the data structures:

```Javascript
// 00-boot-migration.js
const migration = app.get('migration');
const queue = new migration.MigrationQueue();
```

You can also `require` the package, for now this does not make a difference.

```Javascript
const migration = require('@joinbox/loopback-component-jb-migration';

module.exports = class MyTask extends migration.Task {
}
```

## The MigrationModel

All migrations are tied together by a migration model. The migration model basically determines 
which datasource you want to apply your migration tasks to (the one it is attached to) and will
be used to persist the result of a task. A migration model has to fulfill a certain interface,
as given by the [`migration-mixin`](src/mixins/migration-mixin.js). Your `MyMigration` model could
look as follows:

```Json
{
  "name": "MyMigration",
  "base": "PersistedModel",
  "mixins": {
    "MigrationMixin": true
  }
}
```

## The MigrationMixin

The migration-mixin defines the interface your model has to fulfill. You can use the mixin in your
application by referencing it in the mixins section of you `model-config.json`:

```JSON
{
    "_meta": {
        "mixins": [
            "@joinbox/loopback-component-jb-migration/src/mixins"
        ]
    }
}
```

Be aware: this is similar to a deep include and should be optimized in future versions.

## Tasks, MigrationTask and the MigrationQueue

Basically every element is a Task (or a corresponding subclass). The basic structure of your setup
should look as follows:

  - MigrationQueue
    - MigrationTask1
      - ConcreteTask1
    - MigrationTask2
      - ConcreteTask2
    - MigrationTask3
      - ConcreteTask3

You can access all the classes either by including the package or using the component itself as
described above.

### Task

All steps in a migration are defined as tasks. All the tasks have a
`async run(depencencies, previousResult)` method. Dependencies is currently only an object
containing the `MigrationModel` reference and a `transaction` if it exists. And was introduced to
provide a flexible interface for future versions. Every task has an identifier.

If you want to create a custom task, just extend the Task class and implement the aforementioned
`run` method.

### MigrationTask

A MigrationTask is an extended version of the basic Task class which delegates to a concrete task
if the task did not already run. It performs the following steps:

  1. It checks if a task did already run using the `MigrationModel.taskRanSuccessfully(task, transaction)`
  method. The migration model by default tries to load an instance of a migration with the identifier
  of the task in the database.
  2. If the task did not run it will create an instance of the `MigrationModel` using `Migration.start`
  3. After it will execute the task and store its result using the previously created migration entity
  (to prevent it from running again).

One can prevent the MigrationTask from running a task only once by setting the `runAlways` option
to `true`.

_We also use this to bypass this check when creating the table for the migrations, which will
otherwise lead to an error._

```Javascript
class MyTask extends Task {
    constructor() {
        const identifier = 'MyTask';
        const options = {
            runAlways: true,
        };
        super({identifier, options });
    }
}
```

#### MigrationQueue

The MigrationQueue takes all your tasks (doesn't matter if it is a MigrationTask or a _plain_ Task)
and runs them one after the other. It determines which is the current MigrationModel and opens a
transaction on the underlying connector if configured accordingly:

```Javascript
const { MigrationQueue } = require('@joinbox/loopback-component-jb-migration');
const tasks = [/*your tasks*/];
const queue = new MigrationQueue(tasks, {
    // name of the migration model, defaults to 'Migration'
    migrationModelName: 'MyMigration',
    transactionConfig: {}
});
queue.run({ app });
```

The `transactionConfig` object has two purposes:

  1. if it is present (no falsy value), the queue will open a transaction and pass it to the tasks
  2. it will be handed over to Loopbacks methods to open the transaction (see https://loopback.io/doc/en/lb3/Using-database-transactions.html#options)

After all tasks are executed, the queue will commit the transaction or roll it back on error.

### Transactions

All the tasks have to be aware of transactions and have to pass them to all the methods that might
use a transaction (via the `options`). The transaction is passed to the tasks in the dependencies
object used by the `run` method. A transaction is fully optional.

### Concrete Tasks

The package provides some pre-made tasks that can be accessed using the `tasks` property.

#### ExecuteSQLStatementTask

A simplified interface to execute sql statements. The class takes either a `filePath` or a `statement`
as a parameter to the constructor. It will either read in the file or execute the passed statement
directly on the data source of the migration model:

```Javascript
const path = require('path');
const jbMigration = require('@joinbox/loopback-component-jb-migration');
const { ExecutSQLStatementTask } = jbMigration.tasks;

const createMyTable = new ExecuteSqlStatementTask({
    identifier: 'CreateMyModelTable',
    filePath: path.resolve(__dirname, './createMyModelTable.sql'
});
```

#### Postgres: CreateMigrationTable, DropMigrationTable

Concrete Tasks to create or drop the table for the basic migration model:

```Javascript
const path = require('path');
const jbMigration = require('@joinbox/loopback-component-jb-migration');
const {
    CreateMigrationTable,
    DropMigrationTable,
} = jbMigration.tasks.postgres;

const createMigrationTableTask = new CreateMigrationTable();
const dropMigrationTableTask = new DropMigrationTable();
```

## Example

You should perform your migrations at the beginning of the boot phase of Loopback, _e.g:_ in a file
called `00-create-model-tables.js`:

```Javascript
module.exports = async (app) => {
    const migration = app.get('migration');
    const tasks = [
        new migration.tasks.postgres.CreateMigrationTable(),
        new migration.tasks.ExecuteSQLStatementTask({
            identifier: 'CreateMyModelTable',
            statement: `CREATE TABLE IF NOT EXISTS "mySchema"."myModel" (
                id SERIAL PRIMARY KEY
            )`,
        }),
    ];
    // wrap all tasks in a migration task to see what has happened
    const migrationTasks = tasks.map((task) => new migration.MigrationTask(task));
    // queue with transactions
    const queue = new migration.MigrationQueue(migrationTasks, {
            transactionConfig: {},
            migrationModelName: 'MyMigration',
        }
    );
    return queue.run({ app });
};

## Databases

Currently we only provide explicit support for the postgres connector, but basically, all data
structures provided by the package can be used with an arbitrary data source.

### Schema

In your tasks you can execute raw sql (have a look at the `CreateMigrationTable` class in the tasks
folder). One can usually override the `schema` per model using connector specific
configuration, _i.e._

```JSON
{
  "name": "MyMigration",
  "options": {
    "validateUpsert" : true,
    "postgresql": {
      "table": "MyMigration",
      "schema": "my_migration_schema"
    }
  }
}
```

or per datasource. As soon as you perform raw sql queries you'll be responsible to handle
the schema yourself.

> **Note:** Be aware that Postgres resolves the schema based on the `search_path` which is
`"$user", public` by default. So if you have a schema that has got the same name as the user opening
the connection, it misleadingly looks like your queries do respect the schema out of the box.
**They don't!**

> **Note: Don't touch the `search_path` it is evil!**