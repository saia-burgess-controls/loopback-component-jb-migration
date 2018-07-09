const MigrationQueue = require('./src/MigrationQueue');

// @todo: store the dependencies in the component
// @todo: add an interface to register dependencies
const Component = class Component extends MigrationQueue {
    constructor(name, version, options) {
        super(name, version);
        this.enabled = options.enabled;
    }

    async run(dependencies, previous) {
        if (this.enabled !== true) {
            return null;
        }
        return super.run(dependencies, previous);

    }
};

module.exports = function(loopbackApp, options) {
    const queueName = options.name || 'jb-migration';
    const version = options.version || '1.0.0';
    const enabled = options.enabled !== true;
    // the migration model has to be registered in the
    // model sources "loopback-component-jb-migration/src/models"
    loopbackApp.set('loopback-component-jb-migration', new Component(queueName, version, { enabled }));
};
