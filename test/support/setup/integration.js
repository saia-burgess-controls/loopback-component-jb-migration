const unitSetup = require('./unit');

before('start microservice', function(){
    return this.service.start();
});