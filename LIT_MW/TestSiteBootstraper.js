// Some issue with web3 1.0.0-beta.55 prevents me from resolving promise after deploying a contract.
// SO, DOWNGRADE TO BETA.34
const Web3 = require('web3');
// const Daemon = require('./TestSiteDaemon.js')
const TestSiteDaemon = require('./TestSiteDaemon.js');

var addrRPC = 'ws://localhost:7545';
// In version 0.1, the artifacts are fetched directly from the folder
var addrContractArtifact = "./";
var addrLIT = '0xb95F27bD8304049037E54FB734839963847b5050';

function bootstrap(ownerAcc) {
    let ABI;
    let bytecode;
    [ABI, bytecode] = fetchContractArtifact(addrContractArtifact);

    let capability = determineCapability();

    let web3 = createWeb3Instance(addrRPC);

    deployTestSiteContract(web3, ABI, bytecode, capability, ownerAcc, addrLIT);
    // startDaemon(web3, contract);
}

function fetchContractArtifact(_addrContractArtifact){
    const fs = require('fs');
    let myContractABI = JSON.parse(fs.readFileSync(_addrContractArtifact.concat("testsite.abi")).toString());
    // let myContractABI = fs.readFileSync(_addrContractArtifact.concat("testsite.abi")).toString();
    
    let myContractBytecode = fs.readFileSync(_addrContractArtifact.concat("testsite.bin").toString());
    // let myContractBytecode = fs.readFileSync(_addrContractArtifact.concat("testsite.bin"));
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

function deployTestSiteContract(_web3Instance, _ABI, _bytecode, _capability, _addrOwner, _addrLIT){
    let web3 = _web3Instance;
    let contractInstance;
    
    // Confirmed that all inputs are correct
    // console.log(_web3Instance);
    // console.log(_ABI);
    // console.log(_bytecode);
    // console.log(_capability);
    // console.log(_addrOwner);
    // console.log(_addrLIT);

    testSiteContract = new web3.eth.Contract(_ABI);
    // console.log(contract);

    // return contract.deploy({
    //     data : _bytecode,
    //     arguments: [_capability, _addrLIT]
    // }).then((instance) => {
    //     contractInstance = instance;
    //     return contractInstance;
    // });

    // Calling this will generate a transaction object.
    // Calling send() will deploy the transaction object. This method will return a promise, which would resolve with the new contract instance
    // testSiteContract.deploy({
    //     data : _bytecode,
    //     arguments : [_capability, _addrLIT]
    // }).send({
    //     from : _addrOwner,
    //     gas : 800000
    // }).on('error', (error) => { console.log("error when sending transaction") })
    // .on('transactionHash', (transactionHash) => { console.log(transactionHash) })
    // .on('receipt', (receipt) => {
    //    console.log(receipt.contractAddress) // contains the new contract address
    // })
    // .on('confirmation', (confirmationNumber, receipt) => { console.log(confirmationNumber) }).then(() => {
    //     console.log("reached then()")
    //     console.log(instance)
    // });

    testSiteContract.deploy({
        data : _bytecode,
        arguments : [_capability, _addrLIT]
    }).send({
        from : _addrOwner,
        gas : 800000,
    }).then((instance) => {
        startDaemon(web3, instance);
    });
    
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

bootstrap("0xe4c1226f9a698926e94a551EdBb00AC65375B879");