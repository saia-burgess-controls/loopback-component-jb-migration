const MigrationComponent = require('./src/MigrationComponent.js');

/**
 * Exposes the MigrationComponent on the app (as configured by the exposeAt property.
 *
 * @param loopbackApp
 * @param options
 */
module.exports = function(loopbackApp, { exposeAt = 'jb-migration'} = {}) {
    const component = new MigrationComponent();
    loopbackApp.set(exposeAt, component);
};

// expose the component class so one could require it despite the Loopback interface for components
module.exports.MigrationComponent = MigrationComponent;
