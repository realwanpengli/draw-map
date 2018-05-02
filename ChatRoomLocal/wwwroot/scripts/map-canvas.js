function GetMap() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(39.9611755, -82.9987942),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: zoomLevel
    });
    pushpinLayer =  new Microsoft.Maps.Layer();
    map.layers.insert(pushpinLayer);

    Microsoft.Maps.registerModule('CanvasOverlayModule', '/scripts/CanvasOverlayModule.js');
    Microsoft.Maps.loadModule('CanvasOverlayModule', function () {
        overlay = new CanvasOverlay();
        map.layers.insert(overlay);
    });

    return map;
}

function addPins(aircraftList) {
    fabric.Image.fromURL('images/plane-white.png', (img)=>{
    var l = aircraftList.length; 
    console.log(aircraftList.length + ' planes are flying.');
    added = {};
    for (var i = 0; i < l; i++) {
        var aircraft = aircraftList[i];
        var key = aircraft['Icao'];
        if (key in aircraftDict) continue;
        var location = new Microsoft.Maps.Location(aircraft.Lat, aircraft.Long);
        added[key] = location;
    }
    console.log('added cnt ', Object.keys(added).length);
        for (var key in added) {
            var pt = loc2pt(added[key]);
            var img2 = new fabric.Image(img.getElement(), {
                left: pt.x,
                top: pt.y,
                angle: 0,
                opacity: 0.0,
                originX: 'center',
                originY: 'center'
            });
            img2.key = key;
            overlay._fabric.add(img2);
            aircraftDict[key] = {obj: img2, loc: added[key], rotate:false};
        }
    });
    
}

function initAircraft(aircraftJsonStr) {
    console.log('initAircraft');
    var aircraftList = JSON.parse(aircraftJsonStr);
    clearAllPlanes();
    addPins(aircraftList);
}

function clearAllPlanes() {
    for (var key in aircraftDict) {
        overlay._fabric.remove(aircraftDict[key].obj);
    }
    aircraftDict = {};
}

function clearPlanes(newAircraftList) {
    var curKeys = {};
    var l = newAircraftList.length;
    for (var i = 0; i < l; i++) {
        var key = newAircraftList[i]['Icao'];
        curKeys[key] = 1;
        if (newAircraftList[i]['Gnd'] == true && key in aircraftDict) {
            overlay._fabric.remove(aircraftDict[key].obj);
            delete aircraftDict[key];
        }
    }

    // clear planes not in list any more
    for (key in aircraftDict) {
        if (!(key in curKeys)) {
            overlay._fabric.remove(aircraftDict[key].obj);
            delete aircraftDict[key];
        }
    }
}

function movePins(newAircraftList) {
    var startTime = new Date().getTime();
    var angles  = {};
    var dAngles  = {};
    var oAngles = {};
    newAircraftList.map((ac)=>{
        if (ac.Icao in aircraftDict) {
            oAngles[ac.Icao] = aircraftDict[ac.Icao].obj.angle;
            var from = aircraftDict[ac.Icao].loc;
            var to = new Microsoft.Maps.Location(ac.Lat, ac.Long);
            var toAngle = compDegAnglePt(loc2pt(from), loc2pt(to));
            var fromAngle = aircraftDict[ac.Icao].obj.angle;
            angles[ac.Icao] = toAngle;
            dAngles[ac.Icao] = toAngle - fromAngle;
            if (Math.abs(toAngle + 360 - fromAngle) <= 180) {
                angles[ac.Icao] = toAngle + 360;
                dAngles[ac.Icao] = toAngle + 360 - fromAngle;
            } else if (Math.abs(toAngle - 360 - fromAngle) <= 180) {
                angles[ac.Icao] = toAngle - 360;
                dAngles[ac.Icao] = toAngle - 360 - fromAngle;
            }
        }
        return ac;        
    });

    var isInitAngle = false;
    var frames = 0;
    var animatePins = function() {
        
        frames++;
        var curTime = new Date().getTime();
        var elapseTime = curTime - startTime;
        showTime(curTimestamp + elapseTime * speedup);

        // exit animation
        if (curTime >= startTime + updateDuration) {
            console.log('fps:', Math.round(frames/updateDuration*1000));
            // update aircraftDict
            newAircraftList.map((ac, i)=>{
                if (ac.Icao in aircraftDict) {
                    aircraftDict[ac.Icao].loc = new Microsoft.Maps.Location(ac.Lat, ac.Long);
                }
                return ac;
            });
            if (isInitAngle)
                for (var key in aircraftDict) {
                    aircraftDict[key].rotate = true;
                }
            return;
        }
        // update location
        for (var i = 0; i < newAircraftList.length; i++)  {
            var ac = newAircraftList[i];
            if (!(ac.Icao in aircraftDict)) continue;
            var from = aircraftDict[ac.Icao].loc;
            var to = new Microsoft.Maps.Location(ac.Lat, ac.Long);
            var loc = interpolatePosition(from, to, curTime, startTime, updateDuration);
            var pt = loc2pt(loc);
            aircraftDict[ac.Icao].obj.left = pt.x;
            aircraftDict[ac.Icao].obj.top = pt.y;
            if (Object.keys(angles).length != 0) {
                // update angle
                aircraftDict[ac.Icao].obj.angle = angles[ac.Icao];
                isInitAngle = true;

                // update opacity
                if (ac.Icao in added && isInit == true) aircraftDict[ac.Icao].obj.opacity = 1.0;
            }
        }
        
        // next frame
        fabric.util.requestAnimFrame(animatePins, overlay._fabric.getElement());
        overlay._fabric.renderAll();
    };

    animatePins();
    
}

function updateAircraft(newAircraftJson) {
    var newAircraftList = JSON.parse(newAircraftJson);
    addPins(newAircraftList);
    clearPlanes(newAircraftList);
    movePins(newAircraftList);
}


