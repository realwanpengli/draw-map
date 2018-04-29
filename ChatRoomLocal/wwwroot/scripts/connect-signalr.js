function startConnection(url, configureConnection) {

    return function start(transport) {
        console.log(`Starting connection using ${signalR.TransportType[transport]} transport`);
        var connection = !useLocalSignalR? new signalR.HubConnection(url, { 
            transport: transport,
            uid: username,
            accessTokenFactory: () => accessToken
        }) : new signalR.HubConnection(url, { transport: transport });


        if (configureConnection && typeof configureConnection === 'function') {
            configureConnection(connection);
        }

        return connection.start()
            .then(function() {
                return connection;
            })
            .catch(function(error) {
                console.log(`Cannot start the connection use ${signalR.TransportType[transport]} transport. ${error.message}`);
                if (transport !== signalR.TransportType.LongPolling) {
                    return start(transport + 1);
                }
                return Promise.reject(error);
            });

    }(signalR.TransportType.WebSockets);

}

function onConnectionError(error) {
    if (error && error.message) {
        console.error(error.message);
    }
}

function onConnected(connection) {
    console.log('connection started');
}

function configureConnection(connection) {
    var updateAircraftsCallback = function(duration, str, ind) {
        var aircrafts = JSON.parse(str);
        // if (isInit == false) {
            // aircraftsCache = aircrafts;
        // }
        console.log('updateDuration', updateDuration);
        updateDuration = duration;
        if (ind == 0) 
            isInit = false;
        updateAircraft(aircrafts);
        isInit = true;
        // if (!isInit) {
        //     initAircraft(aircrafts);
        //     isInit = true;
        // } else 
        //     updateAircraft(aircrafts);
        
    };

    // Create a function that the hub can call to broadcast messages.
    connection.on('startUpdate', updateAircraftsCallback);
    connection.on('updateAircraft', updateAircraftsCallback);
    // connection.on('updateBoundRequest', updateBoundRequestCallBack);
    connection.onclose(onConnectionError);
}

function getAccessToken(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response || xhr.responseText));
            }
            else {
                reject(new Error(xhr.statusText));
            }
        };

        xhr.onerror = () => {
            reject(new Error(xhr.statusText));
        }
    });
}
