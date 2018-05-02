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
        // todo reconnect
        var username = generateRandomName();
             console.log("Connecting signalR username", username);
             
             if (!useLocalSignalR)
                 getAccessToken(`/api/auth/chat?uid=${username}`)
                 .then(function(endpoint) {
                     accessToken = endpoint.accessToken;
                     return startConnection(endpoint.serviceUrl, configureConnection);
                 })
                 .then(onConnected)
                 .catch(onConnectionError);
             else
                 startConnection('/chat', configureConnection)
                 .then(onConnected)
                 .catch(onConnectionError);
    }
}

function onConnected(connection) {
    console.log('connection started');
    connection.send('countVisitor');
    // $('#startUpdate').click(function (event) {
    //     console.log("Start updpate aircrafts");
    //     connection.send('startUpdate');
    // });
    
}

function configureConnection(connection) {
    var updateAircraftsCallback = function(duration, aircrafts, ind, serverTimestamp, timestamp, speedupRatio) {
        curTimestamp = timestamp;
        speedup = speedupRatio;
        // var dt = new Date().getTime() - serverTimestamp;
        updateDuration = duration;
        // console.log('@@@dt', dt);
        console.log('updateDuration', updateDuration);
        aircraftJsonStrCache = aircrafts;
        // isInit = false;
        if (ind == 0 ) 
            isInit = false;
        if (!isInit) {
            initAircraft(aircrafts);
            isInit = true;
        } else 
            updateAircraft(aircrafts);
        
    };

    var countVisitorsCallback = (totalVisitors) => {
        $("#counter-checkin").text(`${totalVisitors} joined`);
    }

    // Create a function that the hub can call to broadcast messages.
    connection.on('startUpdate', updateAircraftsCallback);
    connection.on('updateAircraft', updateAircraftsCallback);
    connection.on('countVisitors', countVisitorsCallback);
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
