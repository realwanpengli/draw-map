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
    // var modal = document.getElementById('myModal');
    // modal.classList.add('in');
    // modal.style = 'display: block;';
}

function onConnected(connection) {
    console.log('connection started');
    // connection.send('broadcastMessage', '_SYSTEM_', username + ' JOINED');
    $('#sendmessage').click(function (event) {
        // Call the broadcastMessage method on the hub.
        if (true) {
            var username = "@@@@@@@@@@@@@@@@@@xavier";
            var val = "@@@@@@@@@@@@@@@@@@@is GREAT!";
            connection.send('broadcastMessage', updateDuration, val);
        }

        // Clear text box and reset focus for next comment.
        // messageInput.value = '';
        // messageInput.focus();
        // event.preventDefault();
    });
    // document.getElementById('update').addEventListener('click', function (event) {
    //     // if (event.keyCode === 13) {
    //     //     event.preventDefault();
    //         document.getElementById('sendmessage').click();
    //     //     return false;
    //     // }
    // });
    // document.getElementById('echo').addEventListener('click', function (event) {
    //     // Call the echo method on the hub.
    //     connection.send('echo', username, messageInput.value);

    //     // Clear text box and reset focus for next comment.
    //     messageInput.value = '';
    //     messageInput.focus();
    //     event.preventDefault();
    // });
}

function bindConnectionMessage(connection) {
    var messageCallback = function(name, message) {
        // if (!message) return;
        // Html encode display name and message.
        // var encodedName = name;
        // var encodedMsg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // var messageEntry = createMessageEntry(encodedName, encodedMsg);
                    
        // var messageBox = document.getElementById('messages');
        // messageBox.appendChild(messageEntry);
        // messageBox.scrollTop = messageBox.scrollHeight;

        console.log('signalR', name);
        if (!isInit) {
            initAircraft(message);
            isInit = true;
        } else {
            updateAircraft(message);
        }
    };
    // Create a function that the hub can call to broadcast messages.
    connection.on('broadcastMessage', messageCallback);
    // connection.on('echo', messageCallback);
    connection.onclose(onConnectionError);
}