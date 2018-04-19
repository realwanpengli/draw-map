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
    // connection.send('broadcastMessage', '_SYSTEM_', username + ' JOINED');
    $('#sendmessage').click(function (event) {
        // Call the broadcastMessage method on the hub.
        var username = "@@@@@@@@@@@@@@@@@@xavier";
        var val = "@@@@@@@@@@@@@@@@@@@is GREAT!";
        connection.send('broadcastMessage', updateDuration, val);
    });

    // $('#reset').click(function (event) {
    //     connection.send('', '');
    // });
    
}

function bindConnectionMessage(connection) {
    var messageCallback = function(name, message) {
        console.log('signalR', name);
        if (!isInit) {
            initAircraft(message);
            isInit = true;
        } else {
            updateAircraft(message);
        }
    };

    var echoCallBack = null;
    // Create a function that the hub can call to broadcast messages.
    connection.on('broadcastMessage', messageCallback);
    connection.on('echo', echoCallBack);
    connection.onclose(onConnectionError);
}