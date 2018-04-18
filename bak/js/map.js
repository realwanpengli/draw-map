function loadMapScenario() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(51.5, 0),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 11
    });

    Microsoft.Maps.Events.addHandler(map, 'mouseup', loadAircraftList(updateAircraft));
    Microsoft.Maps.Events.addHandler(map, 'viewchangeend', loadAircraftList(updateAircraft));
    var center = map.getCenter();

    return map;
}



function compAngle(src, dest) {
    var latVec = dest.latitude - src.latitude;
    var longVec = dest.longitude - src.longitude;
    const eps = 1e-6;
    if (Math.abs(latVec) < eps) {
        return 0;
    }
    if (Math.abs(longVec) < eps) {
        if (longVec > 0.) {
            return Math.PI/2;
        } else {
            return -Math.PI/2;
        }

    }

    // todo
    if (false) {

    } else {
        var tan = latVec / longVec;
        var angle = Math.atan(tan);
        return angle;
    }
}

function rotatePushpin(pin, dest, url, angle) {
    console.log('rotatePushpin');
    var img = new Image();
    img.onload = function () {
        var c = document.createElement('canvas');

        var rotationAngleRads = angle;

       //Calculate rotated image size.
        c.width = Math.abs(Math.ceil(img.width * Math.cos(rotationAngleRads) + img.height * Math.sin(rotationAngleRads)));
        c.height = Math.abs(Math.ceil(img.width * Math.sin(rotationAngleRads) + img.height * Math.cos(rotationAngleRads)));

        var context = c.getContext('2d');

        //Move to the center of the canvas.
        context.translate(c.width / 2, c.height / 2);

        //Rotate the canvas to the specified angle in degrees.
        context.rotate(rotationAngleRads);

        //Draw the image, since the context is rotated, the image will be rotated also.
        context.drawImage(img, -img.width / 2, -img.height / 2);

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
            rotatePushpin(pin, dest, getIconUrl(id));
            pin.setLocation(newLoc);
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
    if (long == undefined || long > 90 || long < -90) {
        return false;
    } 
    return true;
}



function _contains(loc, bound) {
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
    var aircraftImage = 'images/plane-new.png';
    if (id == debugAircraft) {
        aircraftImage = 'images/plane.png';
        return aircraftImage;
    }
    return aircraftImage;

}

function addPin(aircraft, aircraftDict, map) {
    if (!_isLatValid(aircraft.Lat) || !_isLongValid(aircraft.Long)) return;
    var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
    var aircraftImage = getIconUrl(aircraft.Icao);
    
    var pin = new Microsoft.Maps.Pushpin(location, {
            icon: aircraftImage,
            title: aircraft.Icao
    });
    // add aircraft to map and dict
    map.entities.push(pin);
    aircraftDict[aircraft.Icao] = pin;
}

function _initAircraft(aircraftList, aircraftDict, map) {
    console.log('is in map', map.getBounds().contains(map.getCenter()));
    var totalCnt = aircraftList.length;
    console.log('totalCnt', totalCnt);
    var displayedCnt = 0;
    var l = aircraftList.length;
    console.log('l',l);
    for (var i = 0; i < l; i++) {
        // console.log('i',i);
        var aircraft = aircraftList[i];

        // debug
        if (debug && aircraft.Icao != debugAircraft) {
            continue;
        }
        // console.log('i',i);

        if (!_containsInScreen(aircraft, map.getBounds())) {
            continue;
        }
        displayedCnt++;
        addPin(aircraft, aircraftDict, map);
    }

    // console.log('map entities', map.entities); 
    console.log('displayedCnt', displayedCnt);
}


function initAircraft(aircraftJsonStr) {
    console.log('initAircraft');
    // console.log('aircraftJsonStr', aircraftJsonStr);
    // var json = JSON.parse(aircraftJsonStr);

    var json = aircraftJsonStr;
    // console.log('json', json);
    var aircraftList = getAircraftList(json);
    // console.log('list', aircraftList);
    _initAircraft(aircraftList, aircraftDict, map);

    //update aircraft
    setInterval(updateAircraft, updateDuration);
}

function updateAircraft(newAircraftList) {
    loadAircraftList(_updateAircraft);
}



async function updateEachAircraft(newAircraft) {
    // console.log('update each', newAircraft.Icao);
    // if (newAircraft.Icao == debugAircraft) {
    //     console.log(debugAircraft, ' location', newAircraft.Lat, newAircraft.Long, newAircraft);
    // } else {
    //     // if (debug) {
    //     //     continue;
    //     // }
    // }

    if (newAircraft.Icao == undefined) return;

    var newLat = newAircraft.Lat;
    var newLong = newAircraft.Long;
    if (newLat == undefined || newLat > 90 || newLat < -90) {
        // console.log('error lat', newLat, 'aircraft', newAircraft);
        // continue;
        return;
    }

    var key = newAircraft.Icao;
    var pin = aircraftDict[key];
    // console.log('newAircraft latitude', newLat);
    var newLoc = new Microsoft.Maps.Location(newLat, newLong);
    // console.log('key', key);
    if (aircraftDict[key] != undefined) {
        movePinToLocation(newLoc, pin, updateDuration-100, updateDelay);
    }
    return;
}


function _addVar(array, data) {
    var newArr = [];
    array.forEach(function(item) {
        item.dict = data;
        newArr.push(item);
    });
    return newArr;
}


// function _dynamicallyAddAircraft(aircraftDict, newAircraftList) {
//     var l = newAircraftList.length;
//     for (var i = 0; i < l; i++) {
//         var aircraft = newAircraftList[i];
//         var lat = aircraft.Lat;
//         var long = aircraft.Long;
//         var loc = Microsoft.Maps.Location(lat, long);
//         var bound = map.getBounds();
//         if (bound.contains(loc)) {
//             aircraftDict[aircraft.Icao] = new 
//         } 
//     }
// }

function _updateAircraft(newAircraftJson) {
    var newAircraftList =  getAircraftList(newAircraftJson);
    console.log('update aircraft');

    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {
        // debug
        if (newAircraftList[i].Icao == debugAircraft) {
            console.log(debugAircraft, ' location', newAircraftList[i].Lat, newAircraftList[i].Long, newAircraftList[i]);
        } else {
            // if (debug) {
            //     continue;
            // }
        }


        if (!_containsInScreen(newAircraftList[i], map.getBounds())) {
            continue;
        }

        var newLat = newAircraftList[i].Lat;
        var newLong = newAircraftList[i].Long;
        if (!_isLatValid(newLat) || !_isLongValid(newLong)) {
            // console.log('error lat', newLat, 'aircraft', newAircraftList[i]);
            continue;
        }

        

        var key = newAircraftList[i].Icao;
        var pin = aircraftDict[key];
        if (pin == undefined) {
            addPin(newAircraftList[i], aircraftDict, map);
            pin = aircraftDict[key];
        }
        var newLoc = new Microsoft.Maps.Location(newLat, newLong);
        if (aircraftDict[key] != undefined) {
            movePinToLocation(newLoc, pin, updateDuration-100, key);
        }
    }
}

