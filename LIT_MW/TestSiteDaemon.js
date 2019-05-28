class DaemonClass {
    constructor(_web3, _contractInstance){
        this.web3 = _web3;
        this.contractInstance = _contractInstance;
    }

    startDaemon() {
        console.log("startDaemon() called.")
        console.log(this.web3);
        console.log(this.contractInstance);
    }
}

// module.exports.TestSiteDaemon = DaemonClass
module.exports = DaemonClass