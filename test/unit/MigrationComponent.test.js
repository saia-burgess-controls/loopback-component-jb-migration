const { expect } = require('chai');

const component = require('../../index');
const MigrationComponent = require('../../src/MigrationComponent');

describe('The component', function() {

    it('registers itself in the app at the "jb-migration" key by default', function(){
        const app = {
            store: {},
            set(key, value) {
                app.store[key] = value;
            },
        };

        component(app);

        expect(app.store)
            .to.have.property('jb-migration')
            .that.is.an.instanceOf(MigrationComponent);
    });

    it('registers itself in the app at the key ("exposeAt") passed by configuration', function(){
        const app = {
            store: {},
            set(key, value) {
                app.store[key] = value;
            },
        };

        component(app, { exposeAt: 'test-migrations' });

        expect(app.store)
            .to.have.property('test-migrations')
            .that.is.an.instanceOf(MigrationComponent);
    });

    it('exposes the basic datastructures', function(){
        expect(MigrationComponent).to.have.property('Task');
        expect(MigrationComponent).to.have.property('MigrationQueue');
        expect(MigrationComponent).to.have.property('MigrationTask');
        expect(MigrationComponent).to.have.property('tasks');
    });

});