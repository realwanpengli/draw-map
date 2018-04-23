
function GetMap() {
    // init map var
    cityLocation = {
        'London': new Microsoft.Maps.Location(51.5074, 0.1278),
        'Shanghai': new Microsoft.Maps.Location(31.2304, 121.4737),
        'NewYork': new Microsoft.Maps.Location(40.7128, -74.0060)
    };

    loadMapScenario();
}

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(51.5074, 0.1278),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: 12
    });
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

    // todo
    if (false) {

    } else {
        var r = Math.sqrt(x*x + y*y);
        var cos = x / r;
        var angle = Math.acos(cos);
        if (y < 0) {
            angle = Math.PI * 2 - angle;
        }
        return angle;
    }
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



function _interpolatePosition(src, dest, curTimestamp, startTimeStamp, duration) {
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
    
    // console.log(id, 'distance', Math.sqrt(latVec * latVec + longVec * longVec));

    rotatePushpin(pin, dest, getIconUrl(id), compAngle(src, dest));

    var start = null;
    var end = null;
    var i = 0;
    var step = function (timestamp) {
        if (!start) {
            start = timestamp;
            end = start + duration;
        }    
        var newLoc = _interpolatePosition(src, dest, timestamp, start, duration);
        
        if (timestamp < end) {
            i++;
            if (i % 2 == 0) { 
                    pin.setLocation(newLoc);
            }
            window.requestAnimationFrame(step);
        } else {
            pin.setLocation(dest);
        }
    }
    window.requestAnimationFrame(step);
}

function _isLatValid(lat) {
    if (lat == undefined || lat > 90 || lat < -90) {
        return false;
    } 
    return true;
}

function _isLongValid(long) {
    if (long == undefined || long > 180 || long < -180) {
        return false;
    } 
    return true;
}

function _containsInScreen(aircraft, bound) {
    var curLat = aircraft.Lat;
    var curLong = aircraft.Long;
    if (!_isLatValid(curLat) || !_isLongValid(curLong)) {
        // console.log('invalid lat');
        return false;
    } 
    var curLoc = new Microsoft.Maps.Location(curLat, curLong);
    if (bound.contains(curLoc)) {
        return true;
    }
    return false;
}


function getIconUrl(id) {
    var aircraftImage = 'images/airplane.svg';
    if (id == debugAircraft) {
        aircraftImage = 'images/plane.png';
        return aircraftImage;
    }
    return aircraftImage;

}

function addPins(aircraftDict, aircraftList, map) {
    var startTime, endTime;
    console.log('add pins');
    startTime = new Date();
    var l = aircraftList.length; 
    console.log('aircraft list len = ', aircraftList.length);
    tmpAircraftList = aircraftList.slice();
    var addedCnt = 0;
    var pins = new Microsoft.Maps.EntityCollection();
    for (var i = 0; i < l; i++) {
        if (!containsLondon(aircraftList[i].From) && !containsLondon(aircraftList[i].To)) {
            continue;
        }

        var aircraft = aircraftList[i];
        // debug
        if (debug) {
            if (aircraft.Icao != debugAircraft) {
                continue;
            }
        }
        // if (!_containsInScreen(aircraft, map.getBounds())) {
        //     continue;
        // }
        if (!_isLatValid(aircraft.Lat) || !_isLongValid(aircraft.Long)) return;
        var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        var aircraftImage = getIconUrl(aircraft.Icao);
        var city = aircraft.From.includes('Shanghai') || aircraft.To.includes('Shanghai') ? '@Sh' : ''; 
        var pin = new Microsoft.Maps.Pushpin(location, {
                icon: aircraftImage,
                title: showTitle? aircraft.Icao: null 
        });
        addedCnt ++;
        // add aircraft to map and dict
        aircraftDict[aircraft.Icao] = pin;
        pins.push(pin);
    }

    map.entities.push(pins);

    endTime = new Date();
    console.log('addpins time', (endTime - startTime)/1000);
}

function _initAircraft(aircraftList, aircraftDict, map) {
    var totalCnt = aircraftList.length;
    console.log('totalCnt', totalCnt);
    addPins(aircraftDict, aircraftList, map);

}


function initAircraft(aircraftJsonStr) {
    console.log('initAircraft');
    var aircraftList = getAircraftList(JSON.parse(aircraftJsonStr));
    _initAircraft(aircraftList, aircraftDict, map);

    
}

function updateAircraft(aircraftJsonStr) {
    _updateAircraft(JSON.parse(aircraftJsonStr));
}


function _addVar(array, data) {
    var newArr = [];
    array.forEach(function(item) {
        item.dict = data;
        newArr.push(item);
    });
    return newArr;
}



function _updateAircraft(newAircraftJson) {
    var startTime, endTime;
    startTime = new Date();

    // remove pushpins out of screen
    // remove pushpins no longer exist
    // todo
    


    var newAircraftList;
    if (newAircraftJson instanceof Array) {
        // console.log('array', newAircraftJson);
        newAircraftList = newAircraftJson;
    } else if (newAircraftJson == undefined) {
        newAircraftList = aircraftList;
    }
    else {
        // console.log('json', newAircraftJson);
        newAircraftList =  getAircraftList(newAircraftJson);
    }

    tmpAircraftList = newAircraftList.slice();
    console.log('update aircraft');

    var pins = new Microsoft.Maps.EntityCollection();
    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {
        // debug
        if (!containsLondon(newAircraftList[i].From) && !containsLondon(newAircraftList[i].To)) {
            continue;
        }

        // if (!_containsInScreen(newAircraftList[i], map.getBounds())) {
        //     continue;
        // }

        var newLat = newAircraftList[i].Lat;
        var newLong = newAircraftList[i].Long;
        if (!_isLatValid(newLat) || !_isLongValid(newLong)) {
            continue;
        }


        var key = newAircraftList[i].Icao;
        var pin = aircraftDict[key];
        var aircraftImage = getIconUrl(newAircraftList[i].Icao);

        // debug
        if (key == '4CA708') {
            console.log('4CA708', newAircraftList[i]);
        }

        if (pin == undefined) {
            var newLoc = new Microsoft.Maps.Location(newLat, newLong);
            var city = newAircraftList[i].From.includes('Shanghai') || newAircraftList[i].To.includes('Shanghai') ? '@Sh' : ''; 
            pin = new Microsoft.Maps.Pushpin(newLoc, {
                    icon: aircraftImage,
                    title: showTitle? newAircraftList[i].Icao + city: null
            });
            pins.push(pin);
            aircraftDict[key] = pin;
        }
    }
    map.entities.push(pins);


    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {

        if (newAircraftList[i].Icao == debugAircraft) {
            console.log(debugAircraft, ' location', newAircraftList[i].Lat, newAircraftList[i].Long, newAircraftList[i]);
        }


        if (!containsLondon(newAircraftList[i].From) && !containsLondon(newAircraftList[i].To)) {
            continue;
        }


        // if (!_containsInScreen(newAircraftList[i], map.getBounds())) {
        //     continue;
        // }

        var newLat = newAircraftList[i].Lat;
        var newLong = newAircraftList[i].Long;
        if (!_isLatValid(newLat) || !_isLongValid(newLong)) {
            continue;
        }

        var key = newAircraftList[i].Icao;
        var pin = aircraftDict[key];
        var newLoc = new Microsoft.Maps.Location(newLat, newLong);
        if (aircraftDict[key] != undefined) {
            // console.log('move aircraft', key);
            movePinToLocation(newLoc, pin, updateDuration-100, key);
        }

    }

    endTime = new Date();
    console.log('updateAircraft time', (endTime - startTime)/1000);
}

function containsLondon(str) {
    if (str == undefined) return false;
    // console.log(str);
    if (str.includes('London') || str.includes('london') || 
        str.includes('Shanghai') || str.includes('shanghai') ||
        str.includes('New York') || str.includes('new york') 
        ) {
        return true;
    }
    return false;
}


function panMap(city) {
    map.entities.clear();
    map.setView({
        center: cityLocation[city]
    });
    initAircraft(aircraftJsonStrCache);
}