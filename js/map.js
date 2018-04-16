function loadMapScenario() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(51.5, 0),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 7
    });

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

function _initAircraft(aircraftList, aircraftDict, map) {
    console.log('is in map', map.getBounds().contains(map.getCenter()));
    var totalCnt = aircraftList.length;
    console.log('totalCnt', totalCnt);
    var displayedCnt = 0;
    for (var i = 0; i < aircraftList.length; i++) {
        var aircraft = aircraftList[i];

        // debug
        if (debug && aircraft.Icao != debugAircraft) {
            continue;
        }

        // console.log('map bound', map.getBounds());
        // console.log('edge north', map.getBounds().getNorth());
        // console.log('lat', aircraft.Lat);
        // console.log('edge south', map.getBounds().getSouth());
        // console.log('edge west', map.getBounds().getWest());
        // console.log('long', aircraft.Long);
        // console.log('edge east', map.getBounds().getEast());
        if (!_containsInScreen(aircraft, map.getBounds())) {
            continue;
        }
        displayedCnt++;

        // todo: what if no long and lat
        if (aircraft.Lat == undefined || aircraft.Lat > 90. || aircraft.Lat < -90.) continue;
        // console.log('aircraftList', aircraftList);
        // console.log('aircraft', aircraft);
        // console.log('lat',aircraft.Lat, 'long',aircraft.Long);
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
                // ,anchor: new Microsoft.Maps.Point(12, 39)
        });
        // todo: what if lat == undefined?
        // add aircraft to map and dict
        if (aircraft.Lat != undefined) {
            map.entities.push(pin);
            aircraftDict[aircraft.Icao] = pin;
        }
    }

    // console.log('map entities', map.entities); 
    console.log('invalid displayedCnt', displayedCnt);
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

function _updateAircraft(newAircraftJson) {
    var newAircraftList =  getAircraftList(newAircraftJson);
    console.log('update aircraft');
    // console.log('newAircraftList', newAircraftList);



    // xxx
    // var p = new Parallel(_addVar(newAircraftList, aircraftDict));

    // console.log('p for update aircraft', p);
    // p.map(function(newAircraft) {
    //     console.log('update each', newAircraft.Icao);
    //     // if (newAircraft.Icao == global.env.debugAircraft) {
    //     //     console.log(global.env.debugAircraft, ' location', newAircraft.Lat, newAircraft.Long, newAircraft);
    //     // } else {
    //     //     // if (debug) {
    //     //     //     continue;
    //     //     // }
    //     // }

    //     if (newAircraft.Icao == undefined) return newAircraft;

    //     var newLat = newAircraft.Lat;
    //     var newLong = newAircraft.Long;
    //     if (newLat == undefined || newLat > 90 || newLat < -90) {
    //         // console.log('error lat', newLat, 'aircraft', newAircraft);
    //         // continue;
    //         return newAircraft;
    //     }

    //     var key = newAircraft.Icao;
    //     var pin = newAircraft.dict[key];
    //     // console.log('newAircraft latitude', newLat);
    //     var newLoc = new Microsoft.Maps.Location(newLat, newLong);
    //     // console.log('key', key);
    //     if (newAircraft.dict[key] != undefined) {
    //         movePinToLocation(newLoc, pin, updateDuration-100, updateDelay);
    //     }
    //     return newAircraft;
    // }).then(function(data) {
    //     console.log('complete update all');
    // });


    // newAircraftList.map(function(item) {
    //     if (item.Icao == debugAircraft) {
    //         console.log(debugAircraft, ' location', item.Lat, item.Long, item);
    //     } else {
    //         // if (debug) {
    //         //     continue;
    //         // }
    //     }

    //     var newLat = item.Lat;
    //     var newLong = item.Long;
    //     if (newLat == undefined) return;
    //     if (newLat > 90 || newLat < -90) {
    //         // console.log('error lat', newLat, 'aircraft', item);
    //         return;
    //     }

        

    //     var key = item.Icao;
    //     var pin = aircraftDict[key];
    //     // console.log('item latitude', newLat);
    //     var newLoc = new Microsoft.Maps.Location(newLat, newLong);
    //     // console.log('key', key);
    //     if (aircraftDict[key] != undefined) {
    //         movePinToLocation(newLoc, pin, updateDuration-100, updateDelay);
    //     }

    // }); 

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
        if (newLat == undefined) continue;
        if (newLat > 90 || newLat < -90) {
            // console.log('error lat', newLat, 'aircraft', newAircraftList[i]);
            continue;
        }

        

        var key = newAircraftList[i].Icao;
        var pin = aircraftDict[key];
        // console.log('newAircraftList[i] latitude', newLat);
        var newLoc = new Microsoft.Maps.Location(newLat, newLong);
        // console.log('key', key);
        if (aircraftDict[key] != undefined) {
            movePinToLocation(newLoc, pin, updateDuration-100, updateDelay);
        }
    }
}

