module.exports = async function(app) {
    const migrationComponent = app.get('jb-migration');
    // for each queue
    //    pass in the migration model
    //    pass in the dataSource
    //       add a migration task
    //          bound to the migration model in its config or the given one
    //          bound to the dataSource in its configuration or the given one


    /*const logger = app.get('microservice-logger');
    const dependencies = { app, logger };
    try {
        await migrationComponent.run(dependencies);
        next();
    } catch (err) {
        next(err);
    }*/
};
