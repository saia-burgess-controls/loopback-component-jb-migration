# loopback-component-jb-migration

Migration component for loopback.

> **Note:** The code is in a really early stage. And is barely tested. Since there's a high
possibility that the interface will change, we decided to go for version 1 as a first version.

## How it works

All migrations are tied together by a migration model. The migration model basically determines 
which datasource you want to apply your migration tasks to (the one it is attached to), will
 be used to store the result of a migration. A migration model has to fulfill a certain interface, 
 as given by the `migration-mixin`.

All steps in a migration are defined as tasks. All the tasks have a 
`async run(depencencies, previousResult)` method. Dependencies is currently only an object containing
the `MigrationModel` reference and a `transaction` if it exists.

Tasks can be wrapped by a `MigrationTask` which will execute the task if needed and store the result
using the `MigrationModel`.

All tasks are executed within a `MigrationQueue`. The queue will open up a transaction on the 
underlying datasource and commit or roll it back depending of the result of the executed tasks 
within.

All the tasks have to be aware of transactions and have to pass them to all the methods that might
use a transaction (via the `options`).

## Schema
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