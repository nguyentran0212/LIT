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

        const hostAddr = "129.127.231.38"
        const knownImages = {
            "grafana" : hostAddr + ":3000",
            "lite-server" : hostAddr + ":8080",
        };

        const Docker = require('dockerode');
        const docker = new Docker();
        let result = "";

        if (_code in knownImages) {
            /*FIXME: Docker by itself does not allow the flexibility and complexity necessary to run an experiment.
                Future version will interface with Docker-compose instead.
            */

            // docker.createContainer({Image: _code, Cmd: [], "HostConfig": {
            //     "PortBindings": {
            //     "3000/tcp": [
            //         {
            //         "HostPort": knownImages[_code].split(":")[1] // Get port by splitting the hostaddr:port string.
            //         }
            //     ]
            //     }, "Binds": ["/Users/trannguyen/Documents/CodeProjects/LIT/LIT_MW/sample/web-template:/src"]}}, function (err, container) {
            //     if(!err){
            //         container.start(function (err, data) {
            //             console.log('container started')
            //             //...
            //         });
            //     } else {
            //         console.log(err)
            //     }
            // });

            // docker.createContainer({Image: _code, Cmd: [], "HostConfig": {
            //     "PortBindings": {
            //     "3000/tcp": [
            //         {
            //         "HostPort": knownImages[_code].split(":")[1] // Get port by splitting the hostaddr:port string.
            //         }
            //     ]
            //     }}}, function (err, container) {
            //     if(!err){
            //         container.start(function (err, data) {
            //             console.log('container started')
            //             //...
            //         });
            //     } else {
            //         console.log(err)
            //     }
            // });
            // FIXME: Results must come from the Docker engine itself, or other means, not hardcoded.
            result = knownImages[_code];
        } else {
            result = "Couldn't find the required experiment code at the specified location";
        }

        

        // VERSION 0.1 USE THIS MECHANISM TO KICKSTART THE ASYNC RESPONSE.
        // IN FUTURE VERSION, THE COLLECT RESULT WILL BE CALLED WHEN THE EXPERIMENT IS DONE.
        setTimeout((this.collectResult).bind(this), 3000, _expID, result);
    }

    // FIXME: Version 0.1 only return the address to access a container, which is hardcoded. 
    collectResult(_expID, _result) {
        console.log("\nInside collectResult method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));

        // VERSION 0.1 HAVE HARDCODED RESULT. IT IS ONLY FOR DEMONSTRATION PURPOSE
        // let result = "http://127.0.0.1:5000";
        this.reportExperimentResult(_expID, _result);
    }

    reportExperimentResult(_expID, _result) {
        console.log("\nInside reportExperimentResult method:");
        console.log("ExpID:" + this.web3.utils.bytesToHex(_expID));
        console.log("Exp result: " + _result);

        // Submit the result back to the smart contract
        this.contractInstance.methods.updateExperimentResult(this.web3.utils.bytesToHex(_expID), _result).send({
            from : this.addrOwner,
            gas : 3000000,
        }).then((receipt) => {
            console.log("\nReported the experiment result to the contract.")
            // console.log(receipt);
        });
    }
}

// module.exports.TestSiteDaemon = DaemonClass
module.exports = DaemonClass