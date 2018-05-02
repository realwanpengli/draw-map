
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
        center: cityLocation['Columbus'],
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        liteMode: true,
        zoom: 5
    });
    pushpinLayer =  new Microsoft.Maps.Layer();
    map.layers.insert(pushpinLayer);

    Microsoft.Maps.registerModule('CanvasOverlayModule', '/scripts/CanvasOverlayModule.js');
    //Load the module.
    Microsoft.Maps.loadModule('CanvasOverlayModule', function () {
        //Implement the new custom overlay class.
        overlay = new CanvasOverlay();
        console.log("overlay", overlay);
        //Add the custom overlay to the map.
        map.layers.insert(overlay);
    });

    // canvas = new fabric.Canvas('flightMapCanvas', {
    //     renderOnAddRemove: false,
    //     selection: false
    // });
    
    // fabric.Image.fromURL('./images/plane.png', planeLoaded);
    
    Microsoft.Maps.Events.addHandler(map, 'click', (e) => {
        console.log('map clicked');
        var arr = [];
        var r2 = 15 * 15;
        for (var key in aircraftDict) {
            arr.push({x: aircraftDict[key].obj.left, y: aircraftDict[key].obj.top, obj:aircraftDict[key].obj});
        }
        arr.reverse();
        arr.map((pt,i)=>{
            var dx = e.point.x - pt.x;
            var dy = e.point.y - pt.y;
            if (dx*dx + dy*dy < r2) {
                console.log('selected:', pt.obj.key);
                $("#news").text(`${pt.obj.key} was selected`);
            }
            return pt;
        });
    });

    return map;
}



function planeLoaded(img) {
    var img2 = new fabric.Image(img.getElement(), {
        left: 200,
        top: 200,
        selectable: false
    });
    console.log('canvas', canvas);
    canvas.add(img2);
}


function compDegAngle(src, dest) {
    var latVec = dest.latitude - src.latitude;
    var longVec = dest.longitude - src.longitude;
    var x = longVec;
    var y = -latVec;
    const eps = 1e-6;
    if (Math.abs(latVec) < eps) {
        if (longVec > 0) {
            return 0;
        }
        return 180;
    }
    if (Math.abs(longVec) < eps) {
        if (latVec < 0.) {
            return 90;
        } else {
            return -90;
        }

    }

    var r = Math.sqrt(x*x + y*y);
    var cos = x / r;
    var angle = Math.acos(cos);
    if (y < 0) {
        angle = Math.PI * 2 - angle;
    }
    return angle * 180 / Math.PI;
}

function compDegAnglePt(pt1, pt2) {
    var x = pt2.x - pt1.x;
    var y = pt2.y - pt1.y;
    const eps = 1e-6;
    if (Math.abs(pt2.y - pt1.y) < eps) {
        if (pt2.x - pt1.x > 0) {
            return 0;
        }
        return 180;
    }
    if (Math.abs(pt2.x - pt1.x) < eps) {
        if (pt2.y - pt1.y < 0.) {
            return -90;
        } else {
            return 90;
        }

    }

    var r = Math.sqrt(x*x + y*y);
    var cos = x / r;
    var angle = Math.acos(cos);
    if (y < 0) {
        angle = Math.PI * 2 - angle;
    }
    return angle * 180 / Math.PI;
}





function loc2pt(loc) {
    return map.tryLocationToPixel(loc, Microsoft.Maps.PixelReference.control);
}

function addPins(aircraftList) {
    fabric.Image.fromURL('images/plane-white.png', (img)=>{
    var l = aircraftList.length; 
    console.log(aircraftList.length + ' planes are flying.');
    // var pins = new Microsoft.Maps.EntityCollection();
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
    // clearAllPlanes();
    addPins(aircraftList);
}

function clearAllPlanes() {
    for (var key in aircraftDict) {
        overlay._fabric.remove(aircraftDict[key].obj);
    }
    aircraftDict = {};
}

function clearPlanes(newAircraftList) {
    // // clear on gnd planes and get cur keys
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

function showTime(time) {
    // console.log("show time");
    var date = new Date(time);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    $('#news').text(formattedTime);
    $('#news2').text(formattedTime);
    
}

function movePins(newAircraftList) {
    var startTime = new Date().getTime();

    // pre compute angle
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
        // console.log('speed up', speedup);
        // console.log('curTimestamp', curTimestamp);
        // console.log('elapseTime', elapseTime);
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
                // if (true && aircraftDict[ac.Icao].rotate == false && ac.Icao in angles) {
                    aircraftDict[ac.Icao].obj.angle = angles[ac.Icao];
                    isInitAngle = true;
                // } else {
                //     // console.log('rotate animation');
                //     var rotateDuration = 800;
                //     var ratio = (curTime - startTime) / rotateDuration;
                //     if (ratio > 1) ratio = 1;
                //     aircraftDict[ac.Icao].obj.angle = oAngles[ac.Icao] + dAngles[ac.Icao] * ratio;
                // }
                // update opacity
                if (ac.Icao in added && isInit == true) aircraftDict[ac.Icao].obj.opacity = 1.0;
            }
        }

        
        // next frame
        fabric.util.requestAnimFrame(animatePins, overlay._fabric.getElement());
        overlay._fabric.renderAll();

        // overlay._fabric._redraw();
    };

    animatePins();
    
}

function updateAircraft(newAircraftJson) {
    var newAircraftList = JSON.parse(newAircraftJson);
    console.log('Update aircraft location.');
    addPins(newAircraftList);
    clearPlanes(newAircraftList);
    movePins(newAircraftList);

    
}


