/* The DaemonClass represents a daemon that control the underlying testsite infrastructure based on instructions from the smart contract. 
    Its prime responsiblity is to call the underlying Docker Engine. 
*/
class DaemonClass {
    constructor(_web3, _contractInstance, _addrOwner){
        this.web3 = _web3;
        this.contractInstance = _contractInstance;
        this.addrOwner = _addrOwner;
    }

    startDaemon() {
        // console.log("startDaemon() called.")
        // console.log(this.web3);
        // console.log(this.contractInstance);

        const testSiteContract = this.contractInstance;
        testSiteContract.events.experimentStaged({}, (error, event) => {
            if(!error){
                // CONVERT THE HEX TO BYTES TO CONVERT IT BACK LATER
                let code = event.returnValues.code;
                let expID = this.web3.utils.hexToBytes(event.returnValues.expID);
                // VERSION 0.1 SUPPORT ONLY ONE TYPE OF EXPERIEMNT: RUNNING CODE ON THE REMOTE INFRASTRUCTURE.
                // RESULT IS THE URL TO ACCESS THE CODE ON THE REMOTE INFRASTRUCTURE AFTER DEPLOYMENT
                console.log("Received an experimentStaged event for the following code:");
                console.log("ExpID:" + this.web3.utils.bytesToHex(expID));
                console.log("Exp code: " + code);

                this.conductExperiment(expID, code);
            } else {
                console.log(error);
            }
            
        });
    }

    // This method is called whenever a new experiment is assigned to the test site
    conductExperiment(_expID, _code) {
        console.log("\nInside conductExperiment method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));
        console.log("Exp code: " + _code);

        this.fetchExperiment(_expID, _code);
    }

    // This method is called to retrieve the code that the experiment demands.
    fetchExperiment(_expID, _code) {
        console.log("\nInside fetchExperiment method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));
        console.log("Exp code: " + _code);

        // VERSION 0.1 DOES NOT CONTROL THE FETCHING OF EXPERIMENT CODE. IT CALLS THE EXECUTE EXPERIEMNT IMMEDIATE.

        this.executeExperiment(_expID, _code);
    }

    executeExperiment(_expID, _code) {
        console.log("\nInside executeExperiment method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));
        console.log("Exp code: " + _code);
        // console.log("NO DOCKER AT THE MOMENT!")

        // TEMPORARY DISABLE DOCKER DUE TO DEVELOPMENT ENVIRONMENT

        const Docker = require('dockerode');
        const docker = new Docker();
        docker.createContainer({Image: "gecko8/lite-server", Cmd: [], "HostConfig": {
            "PortBindings": {
            "3000/tcp": [
                {
                "HostPort": "5000"   //Map container to a random unused port.
                }
            ]
            }, "Binds": ["/Users/trannguyen/Documents/CodeProjects/LIT/LIT_MW/sample/web-template:/src"]}}, function (err, container) {
            if(!err){
                container.start(function (err, data) {
                    console.log('container started')
                    //...
                });
            } else {
                console.log(err)
            }
        });

        // VERSION 0.1 USE THIS MECHANISM TO KICKSTART THE ASYNC RESPONSE.
        // IN FUTURE VERSION, THE COLLECT RESULT WILL BE CALLED WHEN THE EXPERIMENT IS DONE.
        setTimeout((this.collectResult).bind(this), 3000, _expID);
    }

    collectResult(_expID) {
        console.log("\nInside collectResult method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));

        // VERSION 0.1 HAVE HARDCODED RESULT. IT IS ONLY FOR DEMONSTRATION PURPOSE
        let result = "http://127.0.0.1:5000";
        this.reportExperimentResult(_expID, result);
    }

    reportExperimentResult(_expID, _result) {
        console.log("\nInside reportExperimentResult method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));
        console.log("Exp result: " + _result);

        // Submit the result back to the smart contract
        this.contractInstance.methods.updateExperimentResult(this.web3.utils.bytesToHex(_expID), _result).send({
            from : this.addrOwner,
            gas : 100000,
        }).then((receipt) => {
            console.log("\nReported the experiment result to the contract.")
            // console.log(receipt);
        });
    }
}

// module.exports.TestSiteDaemon = DaemonClass
module.exports = DaemonClass