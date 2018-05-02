import pickle 
import os 
import json 
import math 
import util 
import glob
 
conf = util.load_conf(); 
data_folder_path = os.path.join(conf["input_folder"],  '*.json'); 
print(data_folder_path) 
data_files = glob.glob(data_folder_path)
l = conf['length']

filteredPlane = {} 
 
# filter parameter 
minDataCnt = 1 
minTotalTime =  util.min2ms(100) # 60min 
minSequenceDuration = util.min2ms(75) # 30min 
minSequenceCnt = 1 
maxSequenceCnt = 1
maxSpeed = util.km2m(2500) / util.hour2ms(1)
minSpeed = util.km2m(600) /  util.hour2ms(1)


def filterPlanes(stat, filteredPlane):
    longFlightCnt = 0 
    
    for key in stat: 
        # if stat[key] 
        #     print(stat[key])
        #     break
        if stat[key]['Count'] < minDataCnt: continue 
        if stat[key]['TotalTime'] < minTotalTime: continue 
        if len(stat[key]['Sequences']) < minSequenceCnt: continue 
        if len(stat[key]['Sequences']) > maxSequenceCnt: continue 
        cnt = 0 
        isTooFast = False 
        isTooSlow = False 
        # if key == 'AAA224': print(stat[key])
        for seq in stat[key]['Sequences']: 
            duration = seq[1] - seq[0]
            distance = util.dis(seq[2], seq[4], seq[3], seq[5]) 
            if duration != 0: speed = distance/duration
            else: speed = 0 
            if duration >= minSequenceDuration: cnt += 1 
            if speed > maxSpeed: isTooFast = True 
            if speed < minSpeed: isTooSlow = True
            # if key == 'AAA224': print('speed = ', speed / 1000 * 1000 * 60 * 60)
                # print(distance/1000, duration/1000/60, speed / 1000 * 1000 * 60 * 60)
        if cnt < minSequenceCnt: continue
        if isTooFast or isTooSlow: continue 
         
        # decide to add the key 
        filteredPlane[key]=1 
        longFlightCnt += 1 
     
    print("remain planes cnt = ", longFlightCnt) 

def finerFilter():
    lstPostime = {}
    lstLat = {};
    lstLong = {};
    for key in filteredPlane:
        lstPostime[key] = -1;
        lstLong[key] = -1;
        lstLat[key] = -1;
    for i, path in enumerate(data_files):
        if i >= l: break
        acList = util.getAcList(path)
        postime = int(path.split('\\')[-1].split('.')[0])
        for ac in acList:
            key = ac['Icao']
            if key in filteredPlane and 'Lat' in ac and 'Long' in ac:
                if lstPostime[key] != -1:
                    dis = util.dis(lstLat[key], ac['Lat'], lstLong[key], ac['Long']) 
                    duration = (postime - lstPostime[key])
                    speed = dis / duration
                    # print('i = ', i, 'speed = ', speed)
                    if speed > maxSpeed:
                        print(speed / 1000 / (1/1000/60/60))
                        del filteredPlane[key]
                lstPostime[key] = postime
                lstLong[key] = ac['Long'] if 'Long' in ac else lstLong[key]
                lstLat[key] = ac['Lat'] if 'Lat' in ac else lstLat[key]
                    

# filter planes 
print('filter planes') 
stat = util.load_obj(os.path.join(conf["output_folder"], 'stat')) 
# print (stat) 
filterPlanes(stat, filteredPlane) 

print('before remain ', len(filteredPlane))
finerFilter()
print('after  remain ', len(filteredPlane))

with open(os.path.join(conf["output_folder"], 'filtered-plane.json'), 'w') as f: 
  f.write(json.dumps(filteredPlane))