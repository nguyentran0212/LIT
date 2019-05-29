class DaemonClass {
    constructor(_web3, _contractInstance){
        this.web3 = _web3;
        this.contractInstance = _contractInstance;
    }

    startDaemon() {
        // console.log("startDaemon() called.")
        // console.log(this.web3);
        // console.log(this.contractInstance);

        const testSiteContract = this.contractInstance;
        testSiteContract.events.experimentStaged({}, (error, event) => {
            if(!error){
                let code = event.returnValues.code;
                let expID = event.returnValues.expID;
                // VERSION 0.1 SUPPORT ONLY ONE TYPE OF EXPERIEMNT: RUNNING CODE ON THE REMOTE INFRASTRUCTURE.
                // RESULT IS THE URL TO ACCESS THE CODE ON THE REMOTE INFRASTRUCTURE AFTER DEPLOYMENT
                console.log("Received an experimentStaged event for the following code:");
                console.log(code);
                console.log(expID);

                this.conductExperiment(expID, code);
                

            } else {
                console.log(error);
            }
            
        });
    }

    // This method is called whenever a new experiment is assigned to the test site
    conductExperiment(_expID, _code) {
        console.log("\nInside conductExperiment method:");
        console.log(_code);
        console.log(_expID);

        this.fetchExperiment(_expID, _code);
    }

    // This method is called to retrieve the code that the experiment demands.
    fetchExperiment(_expID, _code) {
        console.log("\nInside fetchExperiment method:");
        console.log(_code);
        console.log(_expID);

        // VERSION 0.1 DOES NOT CONTROL THE FETCHING OF EXPERIMENT CODE. IT CALLS THE EXECUTE EXPERIEMNT IMMEDIATE.

        this.executeExperiment(_expID, _code);
    }

    executeExperiment(_expID, _code) {
        console.log("\nInside executeExperiment method:");
        console.log(_code);
        console.log(_expID);

        console.log(typeof(_code))
        console.log(_code == "busybox")

        const Docker = require('dockerode');
        const docker = new Docker();
        docker.createContainer({Image: "busybox", Cmd: []}, function (err, container) {
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
        console.log(_expID);

        let result = "http://127.0.0.1/my-result";
        this.reportExperimentResult(_expID, result);
    }

    reportExperimentResult(_expID, _result) {
        console.log("\nInside reportExperimentResult method:");
        console.log(_expID);
        console.log(_result);
    }
}

// module.exports.TestSiteDaemon = DaemonClass
module.exports = DaemonClass