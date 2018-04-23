import pickle
import os
import json

curDirPath = os.path.dirname(__file__)
def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

filteredPlane = {}

# filter parameter
minDataCnt = 5 * 60
minTotalTime = 3 * 60 * 60;
minSequenceDuration = 30 * 60;
minSequenceCnt = 1;

def filterPlanes(stat, filteredPlane):
    longFlightCnt = 0
    for key in stat:
        if stat[key]['Count'] < minDataCnt:
            continue
        longFlightCnt += 1
        print(stat[key]['Count'])
            
        if stat[key]['TotalTime'] < minTotalTime: continue
        if len(stat[key]['Sequences']) < minSequenceCnt: continue
        cnt = 0
        for seq in stat[key]['Sequences']:
            if seq[1] - seq[0] >= minSequenceDuration: cnt += 1
        if cnt < minSequenceCnt: continue
        filteredPlane[key]=1
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