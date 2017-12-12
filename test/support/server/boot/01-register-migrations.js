module.exports = async function(app, next){
    const migrationComponent = app.get('loopback-component-jb-migration');
    const dependencies = { app };
    try {
        await migrationComponent.run(dependencies);
        next();
    } catch(err){
        next(err);
    }
};
