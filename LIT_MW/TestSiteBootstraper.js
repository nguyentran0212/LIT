// Some issue with web3 1.0.0-beta.55 prevents me from resolving promise after deploying a contract.
// SO, DOWNGRADE TO BETA.34
const Web3 = require('web3');
// const Daemon = require('./TestSiteDaemon.js')
const TestSiteDaemon = require('./TestSiteDaemon.js');

var addrRPC = 'ws://localhost:7545';
// In version 0.1, the artifacts are fetched directly from the folder
var addrContractArtifact = "./";
var addrLIT = '0xE29D2d57b927579f85a90B1c611350b86740875b';

function bootstrap(ownerAcc, addrTestSite = "") {
    let ABI;
    let bytecode;
    [ABI, bytecode] = fetchContractArtifact(addrContractArtifact);

    let capability = determineCapability();

    let web3 = createWeb3Instance(addrRPC);

    deployTestSiteContract(web3, ABI, bytecode, capability, ownerAcc, addrLIT, addrTestSite);
    // startDaemon(web3, contract);
}

function fetchContractArtifact(_addrContractArtifact){
    const fs = require('fs');
    let myContractABI = JSON.parse(fs.readFileSync(_addrContractArtifact.concat("testsite.abi")).toString());
    // let myContractABI = fs.readFileSync(_addrContractArtifact.concat("testsite.abi")).toString();
    
    let myContractBytecode = fs.readFileSync(_addrContractArtifact.concat("testsite.bin").toString());
    // let myContractBytecode = fs.readFileSync(_addrContractArtifact.concat("testsite.bin"));

    // Loading using the JSON file created by Truffle instead
    let myContractArtifact = JSON.parse(fs.readFileSync(_addrContractArtifact.concat("TestSite.json")).toString());
    myContractABI = myContractArtifact.abi;
    myContractBytecode = myContractArtifact.bytecode;

    return [myContractABI, myContractBytecode];
}

function createWeb3Instance(_addrRPC){
    // return new Web3(Web3.providers.WebSockerProvider(_addrRPC));
    provider = new Web3.providers.WebsocketProvider(_addrRPC);
    // provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    return new Web3(provider);
}

function determineCapability(){
    // In version 0.1, the capability fo a test site is always "basic"
    return "basic";
}

function deployTestSiteContract(_web3Instance, _ABI, _bytecode, _capability, _addrOwner, _addrLIT, _addrTestSite){
    let web3 = _web3Instance;
    let contractInstance;

    if(_addrTestSite == ""){
        testSiteContract = new web3.eth.Contract(_ABI);
        testSiteContract.deploy({
            data : _bytecode,
            arguments : [_capability, _addrLIT]
        }).send({
            from : _addrOwner,
            gas : 800000,
        }).then((instance) => {
            startDaemon(web3, instance);
        });
    } else {
        testSiteContract = new web3.eth.Contract(_ABI, _addrTestSite);
        // testSiteContract.address = _addrTestSite;
        startDaemon(web3, testSiteContract);
    }
    
    
    // contract.deploy({
    //     data: _bytecode,
    //     arguments: [_capability, _addrLIT]
    // }).send({
    //     from: _addrOwner,
    //     gas: 4000000,
    //     gasPrice: '300',
    // }).then((instance) => {
    //     console.log(instance);
    // });

}

function startDaemon(_web3Instance, _web3ContractInstance){
    // console.log(_web3ContractInstance);
    // _daemon = new Daemon.TestSiteDaemon(_web3Instance, _web3ContractInstance);
    _daemon = new TestSiteDaemon(_web3Instance, _web3ContractInstance);
    _daemon.startDaemon();
}

bootstrap("0x3A58A6aA3a8DE9f0F20F593fE04155021f43Ad5a", "0xE06d51d68aaD01895530d7E44449b3B159d6fB1f");