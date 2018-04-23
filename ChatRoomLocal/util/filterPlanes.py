import pickle
import os
import json
import math

curDirPath = os.path.dirname(__file__)
def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

filteredPlane = {}

# filter parameter
minDataCnt = 5 * 60
minTotalTime = 3 * 60 * 60
minSequenceDuration = 30 * 60
minSequenceCnt = 1
maxSpeed = 250 * 2 / 1000

def deg2rad(deg):
    return deg * math.pi / 180.0

def dis(lat1, lat2, long1, long2):
    R = 6371
    dLat = deg2rad(lat2-lat1)
    dLon = deg2rad(long2-long1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
    math.cos(deg2rad(lat1)) * math.cos(deg2rad(lat2)) * \
    math.sin(dLon/2) * math.sin(dLon/2)
    c = 2. * math.atan2(math.sqrt(a), math.sqrt(1.-a))
    d = R * c
    return d * 1000
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
            if seq[0] != seq[1]: speed = dis(seq[2], seq[4], seq[3], seq[5])/((seq[1]-seq[0]))
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
stat = load_obj('stat')
# print (stat)
filterPlanes(stat, filteredPlane)

# content = ""
# for item in filteredPlane:
# 	content += item + "\n"



with open(os.path.join(curDirPath, 'filtered-plane.json'), 'w') as f:
	# f.write(content)
	f.write(json.dumps(filteredPlane))