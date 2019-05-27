pragma solidity ^0.5.0;

import "./TestSite.sol";

contract LIT {
    // This struct represents an experiment to be conducted by LIT
    struct Experiment {
        bytes20 id;
        address creator;
        string input;
        string measurement;
        string code;
        // Mapping between testsite and the results that they return
        mapping (address => string) results;
    }

    // Mapping between capabilities and relevant testsites
    // TEMPORARY NOT USING THIS ONE IN VERSION 0.1 DUE TO SECURITY ISSUE WITH INLINE ASSEMBLY
    // mapping (bytes32 => address[]) public capabilityTestSites;

    address[] public testSites;

    // Mapping between experiment and their ID
    mapping (bytes20 => Experiment) public experiments;
    // Mapping between address of LIT users and a nonce for creating experiment ID
    // If nonce is 0, it means that this user has not started an experiment before
    mapping (address => uint) public userNonce;

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

    function registerTestSite(string memory _capability) public {
        // capabilityTestSites[stringToBytes32(_capability)].push(msg.sender);
        testSites.push(msg.sender);
    }
    
    function createExperiment(string memory _input, string memory _measurement, string memory _code) public returns(bytes20 expID) {
        address userAddr = msg.sender;
        
        //Create expID by hashing the sender address with a nonce
        expID = bytes20(keccak256(abi.encodePacked(userAddr, userNonce[userAddr])));
        userNonce[userAddr]++;
        
        // Create and store an experiment struct
        experiments[expID] = Experiment(expID, userAddr, _input, _measurement, _code);
        
        // Emit an event to acknowledge that the experiemnt has been submitted.
        emit experimentSubmitted(expID);
        
        // Return the expID;
        return expID;
    }
    
    function conductExperiment(bytes20 _expID) public {
        // Check if the experiment ID exist
        require(experiments[_expID].id != 0, "The specified experiment does not exist.");
        // Check if the caller is the owner of the experiment
        require(msg.sender == experiments[_expID].creator, "Only the creator of an experiment can start it.");
        
        // Get a reference of the experiment to conduct
        Experiment storage experiment = experiments[_expID];
        
        // Find test sites that can satisfy the experiment input and measurement requirements
        // TEMPORARY DISABLE MAPPING LOOK UP DUE TO SECURITY ISSUE WITH INLINE ASSEMBLY
        // address[] memory relevantSites = capabilityTestSites[stringToBytes32(experiment.measurement)];

        // Assign the experiment to all registered testsites for now.
        address[] memory relevantSites = testSites;
        
        // For each relevant test site
        for (uint i = 0; i < relevantSites.length; i++) {
            // Assign the address of those testsites to the experiment
            experiment.results[relevantSites[i]] = "";
            // Call assign experiment from testSite
            TestSite ts = TestSite(relevantSites[i]);
            ts.assignExperiment(_expID);
        }
        
        emit experimentAssigned(_expID);
    }
    
    function updateExperiment(bytes20 expID, string memory _result) public {
        // Check if the expID exist
        require(experiments[expID].id != 0, "The specified experiment does not exist.");
        
        // Check if the caller is the assigned testsite
        // TBA
        
        // Update the experiment
        address testSiteAddr = msg.sender;
        experiments[expID].results[testSiteAddr] = _result;
        
        emit experimentCompleted(expID);
    }
    
    
    // Utility functions
    // STOP USING THIS FUNCTION DUE TO INLINE ASSEMPLY ISSUE
    // function stringToBytes32(string memory source) private returns (bytes32 result) {
    //     bytes memory tempEmptyStringTest = bytes(source);
    //     if (tempEmptyStringTest.length == 0) {
    //         return 0x0;
    //     }
    
    //     assembly {
    //         result := mload(add(source, 32))
    //     }
    // }
}