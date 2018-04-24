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
minTotalTime =  30 * (60 * 1000) # min
minSequenceDuration = 10 * 60 * 1000 # min
minSequenceCnt = 1
maxSpeed = 900 * 1000 / (60*60*1000) * 3




def filterPlanes(stat, filteredPlane):
    longFlightCnt = 0

    for key in stat:
        if stat[key]['Count'] < minDataCnt:
            continue
            
        if stat[key]['TotalTime'] < minTotalTime: continue
        if len(stat[key]['Sequences']) < minSequenceCnt: continue
        cnt = 0
        isTooFast = False
        cnt_fast = 0
        for seq in stat[key]['Sequences']:
            if seq[1] - seq[0] >= minSequenceDuration: cnt += 1
            if seq[0] != seq[1]: speed = util.dis(seq[2], seq[4], seq[3], seq[5])/((seq[1]-seq[0]))
            else: speed = 0
            # print(speed / 1000 / (1/1000/60/60))
            if (speed > maxSpeed):
                isTooFast = True
                cnt_fast += 1

        if cnt < minSequenceCnt: continue
        
        if isTooFast: 
            continue
        
        # decide to add the key
        filteredPlane[key]=1
        longFlightCnt += 1
    
    print("longFlightCnt = ", longFlightCnt)

# filter planes
print('filter planes')
stat = util.load_obj(os.path.join(conf["output_folder"], 'stat'))
# print (stat)
filterPlanes(stat, filteredPlane)



with open(os.path.join(conf["output_folder"], 'filtered-plane.json'), 'w') as f:
	f.write(json.dumps(filteredPlane))