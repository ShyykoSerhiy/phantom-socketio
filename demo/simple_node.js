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
    path.join(__dirname, 'simple_phantom.js')
];
var child = childProcess.execFile('/Users/serhiyshyyko/Sdk/phantomjs-2.0.0-macosx/bin/phantomjs', childArgs);
child.stdout.on('data', function (data) {
    console.log(data.toString());
});

