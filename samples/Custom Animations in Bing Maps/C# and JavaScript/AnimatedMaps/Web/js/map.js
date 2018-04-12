function loadMapScenario() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(51.50632, -0.12714),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 1
    });

    var center = map.getCenter();

    return map;
}


function _initAircraft(aircraftList, aircraftDict, map) {
    var totalCnt = aircraftList.length;
    console.log('totalCnt', totalCnt);
    for (var i = 0; i < aircraftList.length; i++) {
        var aircraft = aircraftList[i];
        // todo: what if no long and lat
        if (aircraft.Lat == undefined) continue;
        console.log('aircraftList', aircraftList);
        console.log('aircraft', aircraft);
        console.log('lat',aircraft.Lat, 'long',aircraft.Long);
        var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        var pin = new Microsoft.Maps.Pushpin(location, {
            icon: 'images/plane.png',
            anchor: new Microsoft.Maps.Point(12, 39)
        });

        // todo: what if lat == undefined?
        // add aircraft to map and dict
        if (aircraft.Lat != undefined) {
            map.entities.push(pin);
            aircraftDict[aircraft.Icao] = pin;
        }
    } 

}








function movePinToLocation(dest, pin, duration, delay) {
    
    var src = pin.getLocation();
    var latVec = -src.latitude + dest.latitude;
    var longVec = -src.longitude + dest.longitude;
    var cnt = duration / delay;
    var dLatVec = latVec / cnt;
    var dLongVec = longVec / cnt;
    var i = 0;

    var animation = function () {
        var curLoc = pin.getLocation();
        var tmpLat = curLoc.latitude+dLatVec;
        var tmpLong = curLoc.longitude+dLongVec;
        if (tmpLong < -180.) tmpLong += 360.;
        if (tmpLong > 180.) tmpLong -= 360.;
        var newLoc = new Microsoft.Maps.Location(tmpLat, tmpLong);
        pin.setLocation(newLoc);
        i++;
        if (i >= cnt) {
            clearInterval(moveAnimation);            
        }    
    }
    var moveAnimation = setInterval(animation, delay);

}

function initAircraft(aircraftJsonStr) {
    var json = JSON.parse(aircraftJsonStr);
    list = json.acList;
    _initAircraft(aircraftList, aircraftDict, map);
}

function updateAircraft(newAircraftList) {
    loadAircraftList(_updateAircraft);
}

function _updateAircraft(newAircraftList) {
    for (var i = 0; i < newAircraftList.length; i++) {
        var key = newAircraftList[i].Icao;
        if (aircraftDict[key] != undefined) {
            movePinToLocation(aircraftDict[key], updateInterval, updateDelay);
        }
    }
}

