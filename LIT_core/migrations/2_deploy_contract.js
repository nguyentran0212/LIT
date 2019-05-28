var LIT = artifacts.require('LIT');
var TestSite = artifacts.require('TestSite');

module.exports = function(deployer) {
    deployer.deploy(LIT);
    // deployer.deploy(TestSite);
}