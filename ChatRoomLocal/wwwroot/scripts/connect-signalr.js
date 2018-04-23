function startConnection(url, configureConnection) {

    return function start(transport) {

        console.log(`Starting connection using ${signalR.TransportType[transport]} transport`);

        var connection = new signalR.HubConnection(url, { transport: transport });

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
    $('#sendmessage').click(function (event) {
        var info = "Start updpate aircrafts";
        var currentBound = map.getBounds();
        var north = currentBound.getNorth();
        var east = currentBound.getEast();
        var south = currentBound.getSouth();
        var west = currentBound.getWest();
        connection.send('startUpdate', updateDuration, north, east, south, west);
    });
    
}

function bindConnectionMessage(connection) {
    var updateAircraftsCallback = function(name, aircrafts) {
        // console.log('signalR', name);
        aircraftJsonStrCache = aircrafts;
        if (!isInit) {
            initAircraft(aircrafts);
            isInit = true;
        } else {
            updateAircraft(aircrafts);
        }
    };

    var updateBoundRequestCallBack = function(ind) {
        var currentBound = map.getBounds();
        var north = currentBound.getNorth();
        var east = currentBound.getEast();
        var south = currentBound.getSouth();
        var west = currentBound.getWest();
        // console.log('updateBoundRequestCallBack', north);
        // console.log('ind = ', ind)
        connection.send('updateBound', ind, north, east, south, west);
    }

    var echoCallBack = function (arg) {
        console.log('echo callback', arg);
    };
    // Create a function that the hub can call to broadcast messages.
    connection.on('startUpdate', updateAircraftsCallback);
    connection.on('updateAircraft', updateAircraftsCallback);
    connection.on('echo', echoCallBack);
    connection.on('updateBoundRequest', updateBoundRequestCallBack);
    connection.onclose(onConnectionError);
}