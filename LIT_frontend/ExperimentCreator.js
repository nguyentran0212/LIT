const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))


const fs = require('fs');
let TestSiteArtifact = JSON.parse(fs.readFileSync("./TestSite.json").toString());

const testSiteAddress = "0xE06d51d68aaD01895530d7E44449b3B159d6fB1f"
let testSiteInstance = new web3.eth.Contract(TestSiteArtifact.abi, testSiteAddress);

let _expID = web3.utils.asciiToHex("experiment", 20);
let fromAccount = "0x3A58A6aA3a8DE9f0F20F593fE04155021f43Ad5a";
testSiteInstance.methods.assignExperiment(_expID).send({
    from : fromAccount,
    gas : 100000
});