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




// function movePinToLocation(dest, pin, duration, delay) {
    
//     var src = pin.getLocation();
//     var latVec = -src.latitude + dest.latitude;
//     var longVec = -src.longitude + dest.longitude;
//     var cnt = duration / delay;
//     var dLatVec = latVec / cnt;
//     var dLongVec = longVec / cnt;
//     var i = 0;

//     var animation = function () {
//         var curLoc = pin.getLocation();
//         var tmpLat = curLoc.latitude+dLatVec;
//         var tmpLong = curLoc.longitude+dLongVec;
//         if (tmpLong < -180.) tmpLong += 360.;
//         if (tmpLong > 180.) tmpLong -= 360.;
//         var newLoc = new Microsoft.Maps.Location(tmpLat, tmpLong);
//         if (i < cnt - 1) {
//             pin.setLocation(newLoc);
//         } else {
//             pin.setLocation(dest);
//         }

//         i++;
//         if (i >= cnt) {
//             clearInterval(moveAnimation);            
//         }    
//     }
//     var moveAnimation = setInterval(animation, delay);
    
//     if (debug) {
//         pin.setOptions({
//             icon: 'images/plane-new.png'
//         });
//     }

// }

function _interpolatePosition(src, dest, curTimestamp, startTimeStamp, duration) {
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;

    var ratio = (curTimestamp - startTimeStamp) / duration;
    var curLat = src.latitude + latVec * ratio;
    var curLong = src.longitude + longVec * ratio;

    return new Microsoft.Maps.Location(curLat, curLong);
}

function movePinToLocation(dest, pin, duration, delay) {
    var src = pin.getLocation();
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;
    // var cnt = duration / delay;
    // var dLatVec = latVec / cnt;
    // var dLongVec = longVec / cnt;

    var start = null;
    var end = null;
    var i = 0;
    var step = function (timestamp) {
        if (!start) {
            start = timestamp;
            end = start + duration;
        }    
        // var progress = timestamp - start;
        var newLoc = _interpolatePosition(src, dest, timestamp, start, duration);
        // if (debug && pin.Icao == debugAircraft) {
            // console.log('cur location', newLoc);
            // console.log('start', start);
            // console.log('timestamp', timestamp);
            // console.log('end', end);
        // }
        if (timestamp < end) {
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


function addPin(aircraft, aircraftDict, map) {
    if (!_isLatValid(aircraft.Lat) || !_isLongValid(aircraft.Long)) return;
    var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
    var aircraftImage;
    if (aircraft.Icao == debugAircraft) {
        aircraftImage = 'images/plane.png';
    } else {
        aircraftImage = 'images/plane-new.png';
    }
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
            movePinToLocation(newLoc, pin, updateDuration-100, updateDelay);
        }
    }
}

