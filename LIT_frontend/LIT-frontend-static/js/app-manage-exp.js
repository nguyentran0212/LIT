App = {
  web3Provider: null,
  contracts: {},
  addrLIT : "0xfb5E753DD0d1E3A53cDBF15fa42a56fE84480e06",
  creatorAcc : "0xED931f77eE703faB8CC41252505a10fA5200095b",
  experimentList : [],

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
      return App.fetchListOfExperiments();
    })

    // return App.bindEvents();
  },

  // bindEvents: function() {
  //   $(document).on('click', '.btn-submit', App.handleSubmit);
  // },

  fetchListOfExperiments: function() {
    var experiment = {
      id: "",
      state : 0,
      name: "",
      creator : "",
      homepage : "",
      relatedArtifact : "",
      input: "",
      measurement: "",
      code : "",
    };

    var contractInstance;
    var numExp = 0;
    App.contracts.LIT.at(App.addrLIT).then((instance) => {
      contractInstance = instance;
      console.log(instance);

      // Get total number of experiments by this account
      return instance.userNonce.call(App.creatorAcc);
    }).then((result) => {
      // Parse the returned value
      var numExp = result.c[0]
      console.log("Number of experiments: " + numExp);

      // Retrieve experiments started by this account
      for(var i = 0; i < numExp; i++){
        // First, retrieve the ith experiment ID
        contractInstance.userExperiments.call(App.creatorAcc, i).then(value => {
          var expID = value;
          console.log("From user experiment " + expID);

          // Then retrieve the experiment results
          
          contractInstance.getRespondedTestSites.call(expID).then(value => {
            var respondedTestSites = value;
            for(var j = 0; j < respondedTestSites.length; j++){
              addrTestSite = respondedTestSites[j];
              console.log(expID + " - " + addrTestSite);
              
              contractInstance.getExperimentResults.call(expID, respondedTestSites[j]).then(value => {
                console.log(addrTestSite + " - " + value);
              })
            }
          });

          // Then retrieve the experiment itself
          contractInstance.experiments.call(expID).then(value => {
            // Create an instance
            var exp = {
              id: value[0],
              state : value[1].c[0],
              name : "",
              creator: value[2],
              homepage: value[3],
              relatedArtifact : value[4],
              input: value[5],
              measurement: value[6],
              code : value[7],
            };

            console.log(value);

            // Push to the list of experiments
            // THIS IS ONLY AS PLACE HOLDER. CANNOT GET THE LIST OF EXPERIMENT SYNCHRONOUSLY
            App.experimentList.push(exp);

            // INSTEAD, WE NEED TO ADD EXP DIRECTLY TO GUI ONE BY ONE
            App.addExperimentToHTML(exp);
          })
        });
      }
    });
  },

  // Update the interface with experiment code
  addExperimentToHTML : function(_exp) {
    console.log(_exp)
    // Get the templates
    var expList = $("#expList");
    var expTemplate = $('#expTemplate');

    // Populate the template
    expTemplate.find('.experiment-id').text(_exp.id);
    expTemplate.find('.experiment-creator').text(_exp.creator);
    expTemplate.find('.experiment-homepage').text(_exp.homepage);
    expTemplate.find('.experiment-artifact').text(_exp.relatedArtifact);
    expTemplate.find('.experiment-code').text(_exp.code);
    expTemplate.find('.experiment-input').text(_exp.input);
    expTemplate.find('.experiment-measurement').text(_exp.measurement);

    expList.append(expTemplate.html());
  },
  
  addTestSiteResultToHTML : function (_exp) {

  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
