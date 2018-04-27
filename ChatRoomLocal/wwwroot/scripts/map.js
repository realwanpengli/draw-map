
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

var offCtxes = [];
var locations;
var stage;
var mapCanvas;

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: cityLocation['Columbus'],
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: 6
    });
    
    // Register and load Custom module
    Microsoft.Maps.registerModule('CanvasOverlayModule', '/scripts/CanvasOverlayModule.js');
    //Load the module.
    Microsoft.Maps.loadModule('CanvasOverlayModule', function () {
        // var locations = Microsoft.Maps.TestDataGenerator.getLocations(1, map.getBounds());
        locations = Microsoft.Maps.TestDataGenerator.getLocations(10000, map.getBounds());

        //Create a pushpin icon on an off screen canvas.
        var offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = 14;
        offScreenCanvas.height = 14;

        //Draw a circle on the off screen canvas.
        // var offCtx = offScreenCanvas.getContext('2d');
        offCtx = offScreenCanvas.getContext('2d');
        offCtx.fillStyle = 'blue';
        offCtx.lineWidth = 2;
        offCtx.strokeStyle = 'black';
        offCtx.beginPath();
        offCtx.arc(7, 7, 5, 0, 2 * Math.PI);
        offCtx.closePath();
        offCtx.fill();
        offCtx.stroke();

        //Implement the new custom overlay class.
        var overlay = new CanvasOverlay(function (canvas) {
            mapCanvas = canvas;

            //Calculate pixel coordinates of locations.
            var points = map.tryLocationToPixel(locations, Microsoft.Maps.PixelReference.control);
            
            //Get the context of the main canvas.
            var ctx = canvas.getContext("2d");
            
            //Buffer map dimensions to account for radius of points.
            var mapWidth = map.getWidth() + 7;
            var mapHeight = map.getHeight() + 7;

            //Draw the off screen canvas for each location.
            for (var i = 0, len = points.length; i < len; i++) {
                //Don't draw the point if it is not in view. This greatly improves performance when zoomed in.
                // if (points[i].x >= -7 && points[i].y >= -7 && points[i].x <= mapWidth && points[i].y <= mapHeight) {
                    ctx.drawImage(offScreenCanvas, points[i].x - 7, points[i].y - 7, 10, 10);
                // }
            }
        });

        

        //Add a click event to the map and check to see if a circle is clicked.
        Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
            setInterval(() => {
                var src = map.tryLocationToPixel(locations, Microsoft.Maps.PixelReference.control);
                var newlocs = locations.map((loc)=>{return new Microsoft.Maps.Location(loc.latitude+0.01, loc.longitude);});
                var dest = map.tryLocationToPixel(newlocs, Microsoft.Maps.PixelReference.control);
                locations = newlocs;
                var ctx = mapCanvas.getContext("2d");
                var mapWidth = map.getWidth() + 7;
                var mapHeight = map.getHeight() + 7;

                ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
                //Draw the off screen canvas for each location.
                for (var i = 0, len = dest.length; i < len; i++) {
                    //Don't draw the point if it is not in view. This greatly improves performance when zoomed in.
                    // if (dest[i].x >= -7 && dest[i].y >= -7 && dest[i].x <= mapWidth && dest[i].y <= mapHeight) {
                        ctx.drawImage(offScreenCanvas, dest[i].x - 7, dest[i].y - 7, 10, 10);
                    // }
                }
            }, 30);
        });

        //Add the custom overlay to the map.
        map.layers.insert(overlay);
    });
    
    pushpinLayer =  new Microsoft.Maps.Layer();
    map.layers.insert(pushpinLayer);

    return map;
}

function compAngle(src, dest) {
    var latVec = dest.latitude - src.latitude;
    var longVec = dest.longitude - src.longitude;
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

function rotatePushpin(pin, dest, url, angle) {
    var img = new Image();
    img.onload = function () {
        var c = document.createElement('canvas');

        // var rotationAngleRads = angle;
        var rotationAngleRads = angle;

       //Calculate rotated image size.
       var dx = Math.abs(Math.cos(rotationAngleRads));
       var dy = Math.abs(Math.sin(rotationAngleRads));
       var width = Math.round(img.width * dx + img.height * dy);
       var height = Math.round(img.width * dy + img.height * dx);


        c.width = width;
        c.height = height;

        var context = c.getContext('2d');

        //Move to the center of the canvas.
        context.translate(c.width / 2, c.height / 2);

        //Rotate the canvas to the specified angle in degrees.
        context.rotate(rotationAngleRads);

        context.translate(-img.width / 2, -img.height / 2)
        //Draw the image, since the context is rotated, the image will be rotated also.
        context.drawImage(img, 0,0);

        pin.setOptions({
            icon: c.toDataURL()
        });
        
    };

    //Allow cross domain image editting.
    img.crossOrigin = 'anonymous';
    img.src = url;
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

function movePinToLocation(dest, pin, duration, id) {
    var src = pin.getLocation();
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;
    
    rotatePushpin(pin, dest, getIconUrl(id), compAngle(src, dest));

    var timestamp = performance.now();
    var start = timestamp;
    var end = start + duration;
    var h;
    var step = function () {
        var timestamp = performance.now();
        var newLoc = interpolatePosition(src, dest, timestamp, start, duration);
        if (timestamp < end) {
            pin.setLocation(newLoc);
        } else {
            pin.setLocation(dest);
            clearInterval(h);
        }
    }

    h = setInterval(step, updateDelay);
    
}



function getIconUrl(id) {
    var aircraftImage = 'images/airplane.svg';
    return aircraftImage;

}

function addPins(aircraftList) {
    var l = aircraftList.length; 
    console.log(aircraftList.length + ' planes are flying.');
    var pins = new Microsoft.Maps.EntityCollection();
    for (var i = 0; i < l; i++) {
        var aircraft = aircraftList[i];
        var key = aircraft['Icao'];
        if (key in aircraftDict) continue;
        var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        var aircraftImage = getIconUrl(aircraft.Icao);
        var pin = new Microsoft.Maps.Pushpin(location, {
                icon: aircraftImage,
                title: showTitle? aircraft.Icao: null,
                visible: true
        });
        aircraftDict[aircraft.Icao] = pin;
        pushpinLayer.add(pin);
        console.log(pin.getIcon());
    }
}

function initAircraft(aircraftJsonStr) {
    console.log('initAircraft');
    var aircraftList = JSON.parse(aircraftJsonStr);
    clearAllPlanes();
    addPins(aircraftList);
    pushpinLayer.setVisible(false);
}

function clearAllPlanes() {
    pushpinLayer.clear();
    aircraftDict = {};
}

function clearPlanes(newAircraftList) {
    // clear on gnd planes and get cur keys
    var curKeys = {};
    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {
        var key = newAircraftList[i]['Icao'];
        curKeys[key] = 1;
        if (newAircraftList[i]['Gnd'] == true && key in aircraftDict) {
            pushpinLayer.remove(aircraftDict[key]);
            delete aircraftDict[key];
        }
    }

    // clear planes not in list any more
    for (key in aircraftDict) {
        if (key in curKeys == false) {
            pushpinLayer.remove(aircraftDict[key]);
            delete aircraftDict[key];
        }
    }
}

function movePins(newAircraftList) {
    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {
        var key = newAircraftList[i]['Icao'];
        if (aircraftDict[key] != undefined) {
            var newLat = newAircraftList[i].Lat;
            var newLong = newAircraftList[i].Long;
            var key = newAircraftList[i].Icao;
            var pin = aircraftDict[key];
            var newLoc = new Microsoft.Maps.Location(newLat, newLong);
            movePinToLocation(newLoc, pin, updateDuration, key);
        }
    }
}

function updateAircraft(newAircraftJson) {
    var newAircraftList = JSON.parse(newAircraftJson);
    console.log('Update aircraft location.');
    addPins(newAircraftList);
    clearPlanes(newAircraftList);
    pushpinLayer.setVisible(true);
    movePins(newAircraftList);
}
