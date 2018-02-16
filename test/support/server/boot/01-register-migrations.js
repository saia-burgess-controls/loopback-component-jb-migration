module.exports = async function(app, next){
    const migrationComponent = app.get('loopback-component-jb-migration');
    const logger = app.get('microservice-logger');
    const dependencies = { app, logger };
    try {
        await migrationComponent.run(dependencies);
        next();
    } catch(err){
        next(err);
    }
};
