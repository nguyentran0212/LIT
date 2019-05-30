App = {
  web3Provider: null,
  contracts: {},
  experiment: {
    id: "",
    state : 0,
    name: "",
    creator : "",
    homepage : "",
    relatedArtifact : "",
    input: "",
    measurement: "",
    code : "",
  },
  addrLIT : "0xfb5E753DD0d1E3A53cDBF15fa42a56fE84480e06",
  creatorAcc : "0xED931f77eE703faB8CC41252505a10fA5200095b",

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers
    /*
    Modern dapp browsers such as Google Chrome with MetaMask plugin
    will inject an ethereum provider into the window object of the browser
    we can use it to create our web3 object. 
    */
    if (window.ethereum) {
      console.log("Metamask")
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access
        console.error("User denied account access");
      }
    }

    // Legacy dapp browsers
    /*
    Older DApp browser such as Mist does not inject an ethereum object.
    Instead, it will inject a web3 instance.
    */
    else if (window.web3) {
      console.log("Older DApp browser.")
      App.web3Provider = window.web3.currentProvider;
    }
    
    // If no injected web3 instance is detected, fall back to Ganache
    // This is only for development. It is insecure for production.
    else {
      console.log("No injected web3")
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('js/LIT.json', function(data){
      /* Get the necessary contract artifact file and instantiate it will truffle-contract
      Artifacts are information about our contract such as its deployed address and ABI
      */
      var LITArtifact = data;
      App.contracts.LIT = TruffleContract(LITArtifact);

      // Set the provider for our contract
      App.contracts.LIT.setProvider(App.web3Provider);

      // Update the view in case it has changed since the last time we visited it.
      // return App.markAdopted()
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-submit', App.handleSubmit);
  },

  // markAdopted: function(adopters, account) {
  //   var adoptionInstance;

  //   App.contracts.Adoption.deployed().then(function(instance) {
  //     adoptionInstance = instance;
  //     // This call returns a promise object, therefore it can be chained.
  //     return adoptionInstance.getAdopters.call()
  //   }).then(function(adopters) {
  //     // The index i is the ID of a pet. 
  //     // The value adopter[i] is the address of the adopter of i
  //     // So if this address is not zero, the pet has been adopted.
  //     for (i = 0; i < adopters.length; i++) {
  //       if(adopters[i] !== '0x0000000000000000000000000000000000000000') {
  //         $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
  //       }
  //     }
  //   }).catch(function(err){
  //     console.log(err.message);
  //   });
  // },

  getCheckedRadio: function(_radioName) {
    selector = "input[type='radio'][name='"+ _radioName + "']";
    var radios = $(selector);
    var checkedRadio = "";
    for (var i = 0; i < radios.length; i++){
      if(radios[i].checked) {
        checkedRadio = radios[i].value;
      }
    }
    return checkedRadio;
  },

  getTextInput: function(_textName) {
    selector = "input[type='text'][name='"+ _textName + "']";
    var radios = $(selector);
    var textValue = $(selector).val();
    return textValue;
  },

  getExpInfo : function() {
    var experimentOption = App.getCheckedRadio('experiment.option');
    var inputOption = App.getCheckedRadio('input.option');
    var outputOption = App.getCheckedRadio('output.option');
    return [experimentOption, inputOption, outputOption];
  },

  // This is what happened when users click on the button to adopt a pet
  handleSubmit : function(event) {
    // Stop the default behaviour of the event so that we can use ours
    // event.preventDefault();

    
    // // var petId = parseInt($(event.target).data('id'));

    // // This is an instance of the adoption smart contract
    // var adoptionInstance;

    // web3.eth.getAccounts(function(error, accounts) {
    //   if(error) {
    //     console.log(error);
    //   }

    //   // This example hardcode the sending account to by the first one in the chain.
    //   // Production version would be different.
    //   var account = accounts[0];

    //   App.contracts.Adoption.deployed().then(function(instance){
    //     adoptionInstance = instance;
    //     // Execute adopt as a transaction by sending account
    //     // This method will return a promise object.
    //     return adoptionInstance.adopt(petId, {from: account});
    //   }).then(function(result){
    //     // If there is no error, then call the markAdopted method to update the UI
    //     return App.markAdopted();
    //   }).catch(function(err){
    //     console.log(err.message);
    //   });
    // });
    // THIS IS VERSION 0.20.3
    web3 = new Web3(App.web3Provider);
    version = web3.version.api;

    [experimentOption, inputOption, outputOption] = App.getExpInfo();
    [expName, expHomepage, expArtifact, codeLocator] = ["_name", "_homepage", "_artifact", "_codeLocator"].map((item) => {
      return App.getTextInput(item);
    });
   
    var creatorAcc = App.creatorAcc;
    App.experiment = {
      id: "",
      state : 0,
      name: expName,
      creator : creatorAcc,
      homepage : expHomepage,
      relatedArtifact : expArtifact,
      input: inputOption,
      measurement: outputOption,
      code : codeLocator,
    }
    console.log(App.experiment);

    // var contractInstance = App.contracts.LIT.at(App.addrLIT).then((instance) => {
    //   return instance.createExperiment(App.experiment.homepage, App.experiment.relatedArtifact, App.experiment.input, App.experiment.measurement, App.experiment.code, {from : creatorAcc, gas : 900000});
    // });
    var contractInstance;
    App.contracts.LIT.at(App.addrLIT).then((instance) => {
      contractInstance = instance;
      
      // Register for event to get the expID back
      instance.experimentSubmitted().watch(function(error, result) {
        if(!error) {
          var _expID = result.args.expID;
          console.log("Received ExpID from eventSubmitted(): " + result.args.expID);
          // instance.conductExperiment(_expID, " ", {from : creatorAcc, gas : 900000}).then((tx) => {
          //   console.log("Finished calling conduct experiment");
          // }).catch(error => {
          //   console.log(error)
          // });
          return;
        }
        
      });

      instance.experimentAssigned().watch(function(error, result) {
        if(!error) {
          var _expID = result.args.expID;
          console.log("Received ExpID from experimentAssigned: " + result.args.expID);
          // instance.conductExperiment(_expID, " ", {from : creatorAcc, gas : 900000}).then((tx) => {
          //   console.log("Finished calling conduct experiment");
          // }).catch(error => {
          //   console.log(error)
          // });
          return;
        }
        
      });

      instance.experimentCompleted().watch(function(error, result) {
        if(!error) {
          var _expID = result.args.expID;
          console.log("Received ExpID from experimentCompleted: " + result.args.expID);
          // instance.conductExperiment(_expID, " ", {from : creatorAcc, gas : 900000}).then((tx) => {
          //   console.log("Finished calling conduct experiment");
          // }).catch(error => {
          //   console.log(error)
          // });
          return;
        }
        
      });
      
      return instance.createExperiment(App.experiment.homepage, App.experiment.relatedArtifact, App.experiment.input, App.experiment.measurement, App.experiment.code, {from : creatorAcc, gas : 900000});
      // return instance.userExperiments(creatorAcc);
    }).then((tx) => {
      console.log(tx);
    });
    // console.log(contractInstance.createExperiment(App.experiment.homepage, App.experiment.relatedArtifact, App.experiment.input, App.experiment.measurement, App.experiment.code));
  }
  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
