pragma solidity ^0.5.0;

contract TestSite {
    // Address of LIT core for registration and call back
    address addrLIT;
    LIT lit;
    // Address of the owner of the testsite
    address addrOwner;
    // This string describe the capability of a testsite. Will update in the future with more description
    string capability;
    
    // This event is for interacting with the client library on the infrastructure
    event experimentStaged(bytes20 expID, string code);
    
    constructor (string memory _capability, address _addrLIT) public {
        addrLIT = _addrLIT;
        lit = LIT(addrLIT);
        capability = _capability;
        addrOwner = msg.sender;
        
        // Register with LIT
        lit.registerTestSite(_capability);
    }
    
    function assignExperiment(bytes20 _expID) public{
        // Get a reference of the LIT to access the experiment record
        // (bytes20 id, address creator, string memory input, string memory measurement, string memory code) = lit.experiments(_expID);
        (, , , , , , , string memory code) = lit.experiments(_expID);
        // string memory code = "busy box";
        // emit experimentStaged(_expID, code);
        emit experimentStaged(_expID, code);
    }
    
    function updateExperimentResult(bytes20 _expID, string memory _result) public {
        lit.updateExperiment(_expID, _result);
    }
}

contract LIT {
    // This struct represents an experiment to be conducted by LIT
    struct Experiment {
        bytes20 id;
        uint state;
        address creator;
        string homepage;
        string relatedArtifact;
        string input;
        string measurement;
        string code;
    }

    struct ExperimentResult {
        address respondedTestSite;
        string result;
    }
    
    mapping(bytes20 => ExperimentResult[]) results;

    // Mapping between capabilities and relevant testsites
    // TEMPORARY NOT USING THIS ONE IN VERSION 0.1 DUE TO SECURITY ISSUE WITH INLINE ASSEMBLY
    // mapping (bytes32 => address[]) public capabilityTestSites;

    address[] public testSites;

    // Mapping between experiment and their ID
    mapping (bytes20 => Experiment) public experiments;
    // Mapping between address of LIT users and a nonce for creating experiment ID
    // If nonce is 0, it means that this user has not started an experiment before
    mapping (address => uint) public userNonce;

    mapping(address => bytes20[]) public userExperiments;

    event experimentSubmitted(
        bytes20 expID
    );
    event experimentAssigned(
        bytes20 expID
    );
    event experimentCompleted(
        bytes20 expID
    );
    
    enum ExperimentType {Created, Submitted, Assigned, Completed}

    function registerTestSite(string memory _capability) public;
    function getNumberOfResults(bytes20 _expID) public view returns (uint);
    function getExperimentResult(bytes20 _expID, uint index) public view returns (address, string memory);
    function createExperiment(string memory _homepage, string memory _relatedArtifact, string memory _input, string memory _measurement, string memory _code) public returns(bytes20 expID);
    function conductExperiment(bytes20 _expID) public;
    function updateExperiment(bytes20 _expID, string memory _result) public;
}