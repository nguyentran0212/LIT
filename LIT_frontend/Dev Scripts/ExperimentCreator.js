// This script is for invoking the test site smart contract for development purpose

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))


const fs = require('fs');
let TestSiteArtifact = JSON.parse(fs.readFileSync("./TestSite.json").toString());

const testSiteAddress = "0x9A11A851b5F55d31Be684CE5D47ae0C6eeEF1672"
let testSiteInstance = new web3.eth.Contract(TestSiteArtifact.abi, testSiteAddress);

let _expID = web3.utils.asciiToHex("experiment", 20);
let fromAccount = "0x54038334cB9af44492C7676A19813FBD7C0fc024";
testSiteInstance.methods.assignExperiment(_expID).send({
    from : fromAccount,
    gas : 100000
});