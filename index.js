(function () {
    var fs = require('fs');
    var webpage = require('webpage');
    var page;
    var initialized;
    var onListeners = {};

    exports.initialize = function (indexJsDirectory, url, callback) {
        page = webpage.create();
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
        var exception = page.evaluate(function (name, message) {
            try {
                window.socket.emit(name, message);
            } catch (e) {
                return e;
            }
            return null;
        }, name, message);
        if (exception != null) {
            throw exception;
        }
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
