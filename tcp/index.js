var fs = require('fs');
var net = require('net');

var PORT = 32015;
var HOST = 'pub-vrs.adsbexchange.com';
var interval = 15 * 1000;

setInterval(function() {

    var data = ""; 
    var depth = 0;
    var timestamp;
    var client = net.createConnection(PORT, HOST);

    client.on('connect', function(){
        timestamp = new Date().getTime();
        console.log('客户端：已经与服务端建立连接', timestamp);
    });

    client.on('data', function(chunck) {
        var str = chunck.toString();
        var data2 = data;
        var res = "";
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            if (c == "{") depth++;
            else if (c == "}") depth--;
            if (depth < 0) {
                console.log('depth < 0');
            }
            if (depth == 0) {
                client.destroy();
                
                res = str.substring(0, i+1);
                data2 += res;
                console.log('save to file');
                    fs.writeFile('./json/'+ timestamp.toString() +'.json', data2, function(err) {
                        if (err) console.log(err);
                        client.destroy();
                });
                return;
            }
        }

        data += str;
        if (depth == 0) {
            
        }
    });

    client.on('end', function () {
        // console.log(data);
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!end');
    });

    client.on('close', function(data){
        console.log('客户端：连接断开');
    });


    client.on('error', function(err) {
        console.log(data);
        console.log(depth);
        console.log(err);
        client.destroy();
    })
    client.end('你好，我是客户端');
}, interval);