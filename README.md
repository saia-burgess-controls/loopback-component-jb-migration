# loopback-component-jb-migration

Migration component for loopback. Really early stage and does not work as expected yet.

## Todo:

  1. Find the correct timing/phase to run the migrations.
  1. Try to integrate transactions.
  1. Try to make it possible to load and register tasks (_e.g._ from disk)

## Notes:

To make the `Migration` model available to the application, one has to add `'loopback-component-jb-migration/src/models'`
to your `model-config.json`.
