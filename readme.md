download and extract http://history.adsbexchange.com/Aircraftlist.json/2016-06-20.zip to \ChatRoomLocal\data folder

## DDL
5.7 

## Todo List with DDL
- [x] Small dataset with good long flight (4.20)
- [?] Logic code move to server (4.20): different city different hub?
- [ ] Server only send useful info to client, e.g. (icao, lat, long, etc.). (4.20)
- [ ] Server preprocess and verify data first (4.20)
- [ ] Delete plane when it disappears in json list (4.20)
- [ ] Delete planes no longer exist (4.20)
- [x] Better experience of moving city (4.23)
- [ ] Deploy SignalR to Azure (4.25) 
- [ ] Apply curve fitting to plane routes (4.26)

## Todo List without DDL at present
- [ ] Add CSS to button 
- [ ] Figure out why it takes so long to draw pins on map
- [ ] Connect with TCP to get realtime data
- [x] Change plane image to SVG

## Issue
- [x] Planes flying uncontinuesly: data is caputured uncontinuesly
- [ ] Planes fly sometimes quick sometimes slow, since the history data doesn't point out the timestamp.