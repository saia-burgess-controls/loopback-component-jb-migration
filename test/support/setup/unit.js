const path = require('path');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Microservice = require('@joinbox/loopback-microservice');

before('enable chai as promised', function(){
    chai.use(chaiAsPromised);
});

before('boot service', async function(){
    const options = {
        appRootDir: path.resolve(__dirname, '../server'),
        env: 'test'
    };
    this.service = await Microservice.boot(options);
});