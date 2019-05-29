App = {
  web3Provider: null,
  contracts: {},

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
      App.web3Provider = window.web3.currentProvider;
    }
    
    // If no injected web3 instance is detected, fall back to Ganache
    // This is only for development. It is insecure for production.
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Testsite.json', function(data){
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
    web3 = new Web3(App.web3Provider);
    version = web3.version.api;
    // THIS IS VERSION 0.20.3
    alert("hello!" + version)
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
