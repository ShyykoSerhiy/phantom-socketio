# phantom-socketio
This simple library provides the ability to use socket.io-client library inside PhantomJS.

## Example on PhantomJS

```js
var phantomSocket = require('../index.js');
var fs = require('fs');
var system = require('system');
var simpleJsPath = system.args[0];
var indexJsDirectoryPath = simpleJsPath.substring(0, simpleJsPath.lastIndexOf(fs.separator)) + fs.separator + '..';

phantomSocket.initialize(indexJsDirectoryPath, 'http://localhost:3000', function () {
    var count = 0;
    phantomSocket.on('messageFromNode', function(data){
        console.log('Message from node received', data);
        phantomSocket.emit('messageFromPhantom', count)
        count++;
    });

});
```

## Example on Node.js

```js
//starting socket io server
var io = require('socket.io')();
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('messageFromPhantom', function (data) {
        console.log('message from phantom received', data);
    });
    socket.on('disconnect', function () {
        console.log('phantom disconnected');
    });

    var count = 0;
    setInterval(function () {
        socket.emit('messageFromNode', count);
        count++;
    }, 1000);
});
io.listen(3000);

//starting child phantom process
var path = require('path');
var childProcess = require('child_process');

var childArgs = [
    '--local-to-remote-url-access=true',
    path.join(__dirname, 'simple_phantom.js')
];
var child = childProcess.execFile('phantomjs', childArgs);
child.stdout.on('data', function (data) {
    console.log(data.toString());
});
```

## Running the example

```
git clone https://github.com/ShyykoSerhiy/phantom-socketio
cd phantom-socketio
npm install
node demo/simple_node.js
```
expected output
```
a user connected
Message from node received 0

message from phantom received 0
Message from node received 1

message from phantom received 1
Message from node received 2
...
```

## How it works

phantom-socketio opens separate dummy page with socket.io library. On this page it initializes socket.io.

## License

[MIT License](http://opensource.org/licenses/mit-license.php).
