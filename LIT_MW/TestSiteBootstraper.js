/* TestSiteBootstrapper is responsible for
    - Creating / connecting a testsite to its corresponding Smart Contract
    - Starting the daemon, which translate commands from Smart Contracts to the instructions to the underlying testsite.  
*/

// Some issue with web3 1.0.0-beta.55 prevents me from resolving promise after deploying a contract. SO, DOWNGRADE TO BETA.34!
const Web3 = require('web3');
const TestSiteDaemon = require('./TestSiteDaemon.js');
const fs = require('fs');

/* Bootstrap() is responsible for connecting to a smart contract representing a Test Site.
    It creates a TestSite contract if it does not exist.
 */
function bootstrap() {
    // Reading configurations to connect or create a TestSite contract from a JSON file. 
    var configMW = JSON.parse(fs.readFileSync("./mw-config.json").toString());
    // Owner account is the one that would sign transactions on behalf of a test site. 
    var ownerAcc = configMW.ownerAcc;
    // This is the address of the existing smart contract that is relevant to this test site. 
    var addrTestSite = configMW.addrTestSite;
    // This is the address of the LIT contract, which orchestrates the whole operation. 
    var addrLIT = configMW.addrLIT;
    // This is the location of the 
    var addrRPC = configMW.addrRPC;

    // Artifacts are bytecode and ABI of a testsite smart contract. 
    // In version 0.1, both artifacts are stored in a Truffle-contract JSON file. 
    var addrContractArtifact = configMW.addrContractArtifact;
    let ABI;
    let bytecode;
    [ABI, bytecode] = fetchContractArtifact(addrContractArtifact);

    // Retrieve the capability description of the testsite. 
    // In version 0.1, the capability is always "basic".
    // Future versions would allow testsite owner to declare their testsite, or such a value would be determined automatically.
    let capability = determineCapability();

    let web3 = createWeb3Instance(addrRPC);
    deployTestSiteContract(web3, ABI, bytecode, capability, ownerAcc, addrLIT, addrTestSite);
    // startDaemon(web3, contract);
}

function fetchContractArtifact(_addrContractArtifact){
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

    // If an address to a smart contract testsite is not given, deploy a new contract. 
    if(_addrTestSite == ""){
        testSiteContract = new web3.eth.Contract(_ABI);
        testSiteContract.deploy({
            data : _bytecode,
            arguments : [_capability, _addrLIT]
        }).send({
            from : _addrOwner,
            // TOFIX:
            // Make the gas value here more dynamic, or at least reduce this number to a reasonable value.
            gas : 800000,
        }).then((instance) => {
            startDaemon(web3, instance, _addrOwner);
        });
    } 
    // Otherwise, connect to the existing contract and start the daemon
    else {
        testSiteContract = new web3.eth.Contract(_ABI, _addrTestSite);
        startDaemon(web3, testSiteContract, _addrOwner);
    }
}

function startDaemon(_web3Instance, _web3ContractInstance, _addrOwner){
    _daemon = new TestSiteDaemon(_web3Instance, _web3ContractInstance, _addrOwner);
    _daemon.startDaemon();
}

bootstrap();