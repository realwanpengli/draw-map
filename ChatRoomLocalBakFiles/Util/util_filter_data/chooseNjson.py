import os
import glob
import json
import pickle
import math
import util

j = util.load_json('C:\\Users\\wanl\\Documents\\microsoft\\projects\\realtimeAircraftMap\\ChatRoomLocalBakFiles\\data\\n.json')

print(len(j))

my = []

maxlen = 20 * 60
# maxlen = 1

di = {}
maxCnt = 0

for i,v in enumerate(j):
    if i >= maxlen: break
    # print(len(v['acList']))
    aclist = v['acList']
    for i,ac in enumerate(aclist):
        di[ac['Icao']] = di.get(ac['Icao'], 0) + 1


for k in di:
    if di[k] > 400: print ('di', k, di[k])
    if di[k] < 1200:
        di[k] = -1

for i,v in enumerate(j):
    if i >= maxlen: break
    aclist = v['acList']
    newList = []
    for i,ac in enumerate(aclist):
        if di[ac['Icao']] > 0:
            newList.append(ac)
    my.append(newList)
    if len(newList) > maxCnt: maxCnt = len(newList)
    # print(len(newList))

print('maxCnt', maxCnt)
print('saving json')
util.save_json('C:\\Users\\wanl\\Documents\\microsoft\\projects\\realtimeAircraftMap\\ChatRoomLocal\\wwwroot\\data\\flight.json', my)