pragma solidity ^0.5.0;

import "./LIT.sol";

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
        // (, , , , string memory code) = lit.experiments(_expID);
        // string memory code = "busy box";
        // emit experimentStaged(_expID, code);
        emit experimentStaged(_expID, "busy box");
    }
    
    function updateExperimentResult(bytes20 _expID, string memory _result) public {
        lit.updateExperiment(_expID, _result);
    }
}