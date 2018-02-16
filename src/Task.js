const { MigrationError } = require('./error');

module.exports = class Task {

    constructor(name, version) {
        this.name = name;
        this.version = version;
    }

    async run(dependencies, previous) {
        const err = new MigrationError('Task:#run() not implemented');
        return Promise.reject(err);
    }

    async revert(dependencies) {
        const err = new MigrationError('Task:#revert() not implemented');
        return Promise.reject(err);
    }

    async ensureDependencies(container, dependencyNames){
        return new Promise((resolve, reject) => {
            for(const name of dependencyNames) {
                if(!container.hasOwnProperty(name)){
                    const err = new MigrationError(`Unmet depencency ${name} in dependency container`);
                    return reject(err);
                }
            }
            resolve(container);
        });
    }
    // @todo: move this to a microservice utils section
    sourcesToUniqueArray(datasources) {
        const uniqueSources = Object
            .keys(datasources)
            .reduce((map, key) => {
                const source = datasources[key];
                map[source.name] = source;
                return map;
            }, {});

        return Object
            .keys(uniqueSources)
            .map(key => uniqueSources[key]);
    }

};
