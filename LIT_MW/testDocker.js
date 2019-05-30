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