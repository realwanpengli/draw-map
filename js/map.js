function loadMapScenario() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(51.50632, -0.12714),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 1
    });

    var center = map.getCenter();

    return map;
}


function drawAircraft(aircraftList, aircraftDict, map) {
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
        // add aircraft to map and dict
        map.entities.push(pin);
        aircraftDict[aircraft.Icao] = pin;
    } 

}

function moveAllAircrafts(oldAircraftDict, newAircraftList, map) {
    
}

function moveAircraft(aircraft, map) {

}