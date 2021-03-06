
function GetMap() {
    // init map var
    cityLocation = {
        'London': new Microsoft.Maps.Location(51.5074, 0.1278),
        'Shanghai': new Microsoft.Maps.Location(31.2304, 121.4737),
        'NewYork': new Microsoft.Maps.Location(40.7128, -74.0060),
        'Columbus': new Microsoft.Maps.Location(39.9611755, -82.9987942)
    };

    loadMapScenario();
}

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: cityLocation['NewYork'],
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: zoomLevel
    });
    
    // Register and load Custom module
    Microsoft.Maps.registerModule('CanvasOverlayModule', '/scripts/CanvasOverlayModule.js');
    //Load the module.
    Microsoft.Maps.loadModule('CanvasOverlayModule', function () {
        //Implement the new custom overlay class.
        overlay = new CanvasOverlay();
        console.log("overlay", overlay);
        //Add the custom overlay to the map.
        map.layers.insert(overlay);
    });
    
    return map;
}

function compAngle(from, to) {
    var latVec = to.latitude - from.latitude;
    var longVec = to.longitude - from.longitude;
    var x = longVec;
    var y = -latVec;
    const eps = 1e-6;
    if (Math.abs(latVec) < eps) {
        if (longVec > 0) {
            return 0;
        }
        return Math.PI;
    }
    if (Math.abs(longVec) < eps) {
        if (latVec < 0.) {
            return Math.PI/2;
        } else {
            return -Math.PI/2;
        }

    }

    var r = Math.sqrt(x*x + y*y);
    var cos = x / r;
    var angle = Math.acos(cos);
    if (y < 0) {
        angle = Math.PI * 2 - angle;
    }
    return angle;
}

// rotate canvas c
function drawPlane(mapCtx, url, x, y, rotationAngleRads) {
    // rotationAngleRads = rotationAngleRads * 180 / Math.PI;
    var c = document.createElement('canvas');    
    var context = c.getContext('2d');
    var img = new Image();
    img.onload = function () {
       var dx = Math.abs(Math.cos(rotationAngleRads));
       var dy = Math.abs(Math.sin(rotationAngleRads));
       var width = Math.round(img.width * dx + img.height * dy);
       var height = Math.round(img.width * dy + img.height * dx);

        c.width = width;
        c.height = height;

        context.translate(c.width / 2, c.height / 2);
        context.rotate(rotationAngleRads);
        context.translate(-img.width / 2, -img.height / 2)

        context.drawImage(img, 0,0);

        mapCtx.drawImage(c, x, y);  

    };

    //Allow cross domain image editting.
    img.crossOrigin = 'anonymous';
    img.src = url;

    // return c;


    //Create a pushpin icon on an off screen canvas.
    // var offScreenCanvas = document.createElement('canvas');
    // offScreenCanvas.width = 14;
    // offScreenCanvas.height = 14;

    // //Draw a circle on the off screen canvas.
    // var offCtx = offScreenCanvas.getContext('2d');
    // offCtx.fillStyle = 'red';
    // offCtx.lineWidth = 2;
    // offCtx.strokeStyle = 'black';
    // offCtx.beginPath();
    // offCtx.arc(7, 7, 5, 0, 2 * Math.PI);
    // offCtx.closePath();
    // offCtx.fill();
    // offCtx.stroke();
    // return offScreenCanvas;
}



function interpolatePosition(src, dest, curTimestamp, startTimeStamp, duration) {
    if (duration == 0) {
        return dest;
    }
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;

    var ratio = (curTimestamp - startTimeStamp) / duration;
    var curLat = src.latitude + latVec * ratio;
    var curLong = src.longitude + longVec * ratio;

    return new Microsoft.Maps.Location(curLat, curLong);
}


function getIconUrl(id) {
    var aircraftImage = 'images/airplane.svg';
    return aircraftImage;

}

function addPins(aircraftList) {
    var l = aircraftList.length; 
    console.log(aircraftList.length + ' planes are flying.');
    
    for (var i = 0; i < l; i++) {
        var aircraft = aircraftList[i];
        var key = aircraft['Icao'];
        var to = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        var aircraftImage = getIconUrl(aircraft.Icao);
        var angle = 0;
        var from;
        if (key in aircraftDict) {
            from = aircraftDict[key]['location'];
            continue;
            // angle = compAngle(from, to);
        }
        // console.log('planeCanvas', planeCanvas);
        // var pt = map.tryLocationToPixel(to, Microsoft.Maps.PixelReference.control);
        // var planeCanvas = drawPlane(overlay._canvas.getContext("2d"), aircraftImage, pt.x, pt.y, angle);
        aircraftDict[key] = {location: to};
        
    }
    
}

function updateAircraft(aircraftList) {
    console.log('Update aircraft location.', isInit);
    if (!isInit) {
        console.log('init  pins');
        clearAllPlanes();
        addPins(aircraftList);
        isInit = true;
    } else {
        clearAllPlanes();
        // const context = overlay._canvas.getContext('2d');
        // context.clearRect(0, 0, overlay._canvas.width, overlay._canvas.height);
        addPins(aircraftList);
        movePins(aircraftList);
    }
}

function clearAllPlanes() {
    const context = overlay._canvas.getContext('2d');
    for (var k in aircraftDict) {
        var pt = map.tryLocationToPixel(aircraftDict[k].location, Microsoft.Maps.PixelReference.control);
        context.clearRect(pt.x, pt.y, 30*2, 30*2);
    }
    aircraftDict = {};
}

function clearPlanes(newAircraftList) {
    // clear on gnd planes and get cur keys
    // var curKeys = {};
    // var l = newAircraftList.length;
    // for (var i = 0; i < l; i++) {
    //     var key = newAircraftList[i]['Icao'];
    //     curKeys[key] = 1;
    //     if (newAircraftList[i]['Gnd'] == true && key in aircraftDict) {
    //         pushpinLayer.remove(aircraftDict[key]);
    //         delete aircraftDict[key];
    //     }
    // }

    // // clear planes not in list any more
    // for (key in aircraftDict) {
    //     if (key in curKeys == false) {
    //         pushpinLayer.remove(aircraftDict[key]);
    //         delete aircraftDict[key];
    //     }
    // }
}

function movePins(newAircraftList) {
    console.log('move pins');
    var l = newAircraftList.length;
    // var l = 2;
    for (var i = 0; i < l; i++) {
        var key = newAircraftList[i]['Icao'];
        if (key in aircraftDict) {
            var newLat = newAircraftList[i].Lat;
            var newLong = newAircraftList[i].Long;
            var key = newAircraftList[i].Icao;
            var from = aircraftDict[key]['location'];
            var to = new Microsoft.Maps.Location(newLat, newLong);
            // var angle = compAngle(aircraftDict[key]['location'], to);
            movePin(key, from, to);
        }
    }
}

function movePin(key, from, to) {
    var timestamp = performance.now();
    var start = timestamp;
    var end = start + updateDuration;
    var aircraftImage = getIconUrl('');
    var h;
    console.log('from', from);
    console.log('to', to);
    var angle = compAngle(from, to);
    console.log(angle);
    var step = function () {
        var timestamp = performance.now();
        var loc = interpolatePosition(from, to, timestamp, start, updateDuration);
        // const context = overlay._canvas.getContext('2d');
        // context.clearRect(0, 0, overlay._canvas.width, overlay._canvas.height);
        if (timestamp < end) {
            // clearAllPlanes();
            var pt = map.tryLocationToPixel(loc, Microsoft.Maps.PixelReference.control);
            drawPlane(overlay._canvas.getContext("2d"), aircraftImage, pt.x, pt.y, angle);
        } else {
            // clearAllPlanes();
            var pt = map.tryLocationToPixel(to, Microsoft.Maps.PixelReference.control);
            drawPlane(overlay._canvas.getContext("2d"), aircraftImage, pt.x, pt.y, angle);
            aircraftDict[key]['location'] = to;
            clearInterval(h);
        }
    }

    h = setInterval(step, updateDelay);
}

function interpolatePosition(src, dest, curTimestamp, startTimeStamp, duration) {
    if (duration == 0) {
        return dest;
    }
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;

    var ratio = (curTimestamp - startTimeStamp) / duration;
    var curLat = src.latitude + latVec * ratio;
    var curLong = src.longitude + longVec * ratio;

    return new Microsoft.Maps.Location(curLat, curLong);
}