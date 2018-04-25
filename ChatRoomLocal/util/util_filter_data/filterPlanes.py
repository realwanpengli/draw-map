import pickle 
import os 
import json 
import math 
import util 
 
conf = util.load_conf(); 
data_folder_path = os.path.join(conf["input_folder"],  '*.json'); 
print(data_folder_path) 
 
filteredPlane = {} 
 
# filter parameter 
minDataCnt = 1 
minTotalTime =  util.min2ms(75) # 60min 
minSequenceDuration = util.min2ms(75) # 30min 
minSequenceCnt = 1 
maxSequenceCnt = 1
maxSpeed = util.km2m(700) / util.hour2ms(1)
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
        for seq in stat[key]['Sequences']: 
            duration = seq[1] - seq[0]
            distance = util.dis(seq[2], seq[4], seq[3], seq[5]) 
            if duration != 0: speed = distance/duration
            else: speed = 0 
            if duration >= minSequenceDuration: cnt += 1 
            if speed > maxSpeed: isTooFast = True 
            if speed < minSpeed: isTooSlow = True
                # print(distance/1000, duration/1000/60, speed / 1000 * 1000 * 60 * 60)
        if cnt < minSequenceCnt: continue
        if isTooFast or isTooSlow: continue 
         
        # decide to add the key 
        filteredPlane[key]=1 
        longFlightCnt += 1 
     
    print("remain planes cnt = ", longFlightCnt) 
 
# filter planes 
print('filter planes') 
stat = util.load_obj(os.path.join(conf["output_folder"], 'stat')) 
# print (stat) 
filterPlanes(stat, filteredPlane) 
 
 
 
with open(os.path.join(conf["output_folder"], 'filtered-plane.json'), 'w') as f: 
  f.write(json.dumps(filteredPlane))