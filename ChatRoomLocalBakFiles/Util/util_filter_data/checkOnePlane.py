import pickle 
import os 
import json 
import math 
import util 
import glob 

conf = util.load_conf()

conf = util.load_conf()
data_folder_path = os.path.join(conf["input_folder"],  '*.json');
print(data_folder_path)

data_files = glob.glob(data_folder_path)

l = conf['length']

dbgKey = 'A217E2'

lstPostime = -1;
lstLat = -1;
lstLong = -1;

for i, path in enumerate(data_files):
    if i >= l: break
    acList = util.getAcList(path)
    postime = int(path.split('\\')[-1].split('.')[0])
    for j,ac in enumerate(acList):
        # print(ac)
        # if dbgKey == ac['Icao']: print(ac)
        if dbgKey == ac['Icao'] and 'Long' in ac and 'Lat' in ac: 
            # print(i, postime, ac['Long'], ac['Lat'])
            if lstPostime != -1:
                dis = util.dis(lstLat, ac['Lat'], lstLong, ac['Long']) / 1000
                duration = (postime - lstPostime) / 1000 / 60 / 60
                speed = dis / duration
                print('i = ', i, 'speed = ', speed)
                pass
            lstPostime = postime
            lstLong = ac['Long'] if 'Long' in ac else lstLong
            lstLat = ac['Lat'] if 'Lat' in ac else lstLat

