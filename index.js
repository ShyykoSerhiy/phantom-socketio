(function () {
    var fs = require('fs');
    var page;
    var initialized;
    var onListeners = {};

    exports.initialize = function (indexJsDirectory, url, callback) {
        page = require('webpage').create();
        page.open(indexJsDirectory + fs.separator + 'index.html', function (status) {
            var opened = status === 'success';
            if (opened) {
                webpageInitialize(url);
                initialized = true;
                callback();
            }
        });
    };

    exports.on = function (name, callback) {
        checkInitialized();
        addOnListener(name, callback);
        page.evaluate(function (name) {
            window.socket.on(name, function (data) {
                if (typeof window.callPhantom === 'function') {
                    window.callPhantom({
                        name: name,
                        data: data
                    });
                }
            });
        }, name);
    };
    exports.emit = function (name, message) {
        checkInitialized();
        page.evaluate(function (name, message) {
            window.socket.emit(name, message)
        }, name, message);
    };

    function webpageInitialize(url) {
        page.evaluate(function (url) {
            window.socket = window.io(url);
        }, url);
        page.onCallback = function (data) {
            if (data) {
                fireOnEvent(data.name, data.data);
            }
        };
    }

    function checkInitialized() {
        if (!initialized) {
            throw new Error("phantom-socket is not initialized!");
        }
    }

    function addOnListener(name, listener) {
        if (!onListeners[name]) {
            onListeners[name] = [];
        }
        onListeners[name].push(listener);
    }

    function fireOnEvent(name, data) {
        if (!onListeners[name]) {
            return;
        }
        onListeners[name].forEach(function (listener) {
            listener(data);
        });
    }
})();