function loadAircraftList(callback) {
    // var jsonStr = '{"src":1,"feeds":[{"id":1,"name":"From Consolidator","polarPlot":false}],"srcFeed":1,"showSil":true,"showFlg":true,"showPic":true,"flgH":20,"flgW":85,"acList":[{"Id":15205396,"Rcvr":1,"HasSig":false,"Icao":"E80414","Bad":false,"Reg":"CC-BAD","FSeen":"\/Date(1523428290147)\/","TSecs":1,"CMsgs":1,"Alt":18925,"GAlt":19035,"InHg":30.0295277,"AltT":0,"Lat":-32.07631,"Long":-70.84068,"PosTime":1523428290147,"Mlat":false,"Tisb":false,"Spd":500.0,"Trak":170.0,"TrkH":false,"Type":"A320","Mdl":"Airbus A320 233","Man":"Airbus","CNum":"4476","Op":"LATAM Airlines","OpIcao":"LAN","Sqk":"","Vsi":-3000,"VsiT":0,"WTC":2,"Species":1,"Engines":"2","EngType":3,"EngMount":0,"Mil":false,"Cou":"Chile","HasPic":false,"Interested":false,"FlightsCount":0,"SpdTyp":0,"CallSus":false,"Trt":2,"Year":"2010"},{"Id":5023175,"Rcvr":1,"HasSig":false,"Icao":"4CA5C7","Bad":false,"Reg":"EI-DUZ","FSeen":"\/Date(1523428288116)\/","TSecs":3,"CMsgs":2,"AltT":0,"Tisb":false,"TrkH":false,"Type":"A333","Mdl":"Airbus A330 302","Man":"Airbus","CNum":"847","Op":"Aer Lingus","OpIcao":"EIN","Sqk":"","VsiT":0,"WTC":3,"Species":1,"Engines":"2","EngType":3,"EngMount":0,"Mil":false,"Cou":"Ireland","HasPic":false,"Interested":false,"FlightsCount":0,"Gnd":false,"SpdTyp":0,"CallSus":false,"Trt":1,"Year":"2007"},{"Id":13867252,"Rcvr":1,"HasSig":false,"Icao":"D398F4","Bad":false,"FSeen":"\/Date(1523428287085)\/","TSecs":4,"CMsgs":2,"Alt":0,"GAlt":0,"AltT":0,"Tisb":false,"TrkH":false,"Sqk":"","VsiT":0,"WTC":0,"Species":0,"EngType":0,"EngMount":0,"Mil":false,"Cou":"Unknown or unassigned country","HasPic":false,"Interested":false,"FlightsCount":0,"SpdTyp":0,"CallSus":false,"Trt":1},{"Id":7865826,"Rcvr":1,"HasSig":false,"Icao":"7805E2","Bad":false,"Reg":"B-6615","FSeen":"\/Date(1523428284616)\/","TSecs":6,"CMsgs":2,"Alt":32125,"GAlt":32087,"InHg":29.88189,"AltT":0,"Lat":33.376556,"Long":113.99354,"PosTime":1523428284616,"Mlat":false,"Tisb":false,"TrkH":false,"Type":"A320","Mdl":"Airbus A320 232","Man":"Airbus","CNum":"4214","Op":"Shenzhen Airlines","OpIcao":"CSZ","Sqk":"0055","Help":false,"VsiT":0,"WTC":2,"Species":1,"Engines":"2","EngType":3,"EngMount":0,"Mil":false,"Cou":"China","HasPic":false,"Interested":false,"FlightsCount":0,"SpdTyp":0,"CallSus":false,"Trt":2,"Year":"2010"}],"totalAc":4598,"lastDv":"636590125368717178","shtTrlSec":65,"stm":1523428291225}'
    
    //$.getJSON('https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json', callback);
    

    var url = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json';
    $.ajax({
        type: "GET",
        url: url,
        dataType: "jsonp",
        crossDomain: "true",
        success: callback
    });
}

function getAircraftList(json) {
	var list = json.acList;
	return list;
}