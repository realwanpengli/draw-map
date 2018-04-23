
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
        center: cityLocation['NewYork'],
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: 6
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
    // var i = 0;
    var step = function (timestamp) {
        if (!start) {
            start = timestamp;
            end = start + duration;
        }    
        var newLoc = _interpolatePosition(src, dest, timestamp, start, duration);
        console.log('newloc ', newLoc);
        if (timestamp < end) {
            pin.setLocation(newLoc);
            window.requestAnimationFrame(step);
        } else {
            pin.setLocation(dest);
        }
    }
    window.requestAnimationFrame(step);
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
    var pins = new Microsoft.Maps.EntityCollection();
    for (var i = 0; i < l; i++) {
        var aircraft = aircraftList[i];
        
        var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        var aircraftImage = getIconUrl(aircraft.Icao);
        var pin = new Microsoft.Maps.Pushpin(location, {
                icon: aircraftImage,
                title: showTitle? aircraft.Icao: null 
        });
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
    // console.log('aircraft json len', newAircraftJson.length);
    var startTime, endTime;
    startTime = new Date();

    var newAircraftList;
    newAircraftList =  getAircraftList(newAircraftJson);
    tmpAircraftList = newAircraftList.slice();
    console.log('update aircraft');

    var pins = new Microsoft.Maps.EntityCollection();
    var l = newAircraftList.length;

    for (var i = 0; i < l; i++) {
        // debug
        if (newAircraftList[i]['Icao'] != 'A418B2') {continue;}
        
        if (newAircraftList[i]['Icao'] == 'A418B2') {
            console.log('A418B2', newAircraftList[i]['Lat'], newAircraftList[i]['Long']);
        }

        var newLat = newAircraftList[i].Lat;
        var newLong = newAircraftList[i].Long;

        var key = newAircraftList[i].Icao;
        var pin = aircraftDict[key];
        var newLoc = new Microsoft.Maps.Location(newLat, newLong);
        if (aircraftDict[key] != undefined) {
            movePinToLocation(newLoc, pin, updateDuration-100, key);
        }

    }

    endTime = new Date();
    // console.log('updateAircraft time', (endTime - startTime)/1000);
}




function panMap(city) {
    map.entities.clear();
    map.setView({
        center: cityLocation[city]
    });
    initAircraft(aircraftJsonStrCache);
}