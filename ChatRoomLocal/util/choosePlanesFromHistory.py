import os
import glob
import json
import pickle

curDirPath = os.path.dirname(__file__)
data_folder_path = os.path.join(curDirPath, '..', 'data', '*.json');
print(data_folder_path)

data_files = glob.glob(data_folder_path)

l = len(data_files)
record = [{}] * l

def save_obj(obj, name ):
    with open(name + '.pkl', 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

def plane_filter(ac, city):
	if 'From' in ac and city in ac['From'] or \
		'To' in ac and city in ac['To']:
		return True
	return False

def getAcList(path):
	contents = None
	with open(path, 'r', encoding='UTF-8') as f: contents = f.read()  
	j = json.loads(contents)
	acList = j['acList']
	return acList

debug = True
ind  = 0;
maxLen = 1e6;
# maxLen = 5;

"""
get Icao
"""
stat = {}
print('get Icaos')
for path in data_files:
	if debug:
		ind += 1
		if ind > maxLen: 
			break 
	contents = None
	acList = getAcList(path)
	for plane in acList: 
		key = plane["Icao"]
		cnt = 0
		if key in stat and 'Count' in stat[key]: cnt = stat[key]['Count']
		stat[key] = {
			'Count': cnt +1,
			'TotalTime': 0,
			'LastTime': -1,
			'Updated': False,
			'Sequences': [],
			'StartTime': -1
		}


save_obj(stat, 'stat_icao')

# filter parameter
minDataCnt = 1000
minTotalTime = 3 * 60 * 60;
minSequenceDuration = 30 * 60;
minSequenceCnt = 1;

# minDataCnt = -1
# minTotalTime = -1000 * 60 * 1000;
# minSequenceDuration = -60 * 60 * 1000;
# minSequenceCnt = -3;


def getPlaneStat(plane, stat):
	if 'PosTime' not in plane: return
	key = plane['Icao']
	lastTime = stat[key]['LastTime']
	curTime = plane['PosTime']
	stat[key]['Updated'] = True
	duration =  curTime - lastTime if lastTime >= 0 else 0; 
	stat[key]['TotalTime'] = stat[key].get('TotalTime', 0) + duration;
	stat[key]['LastTime'] = curTime
	stat[key]['StartTime'] = curTime if stat[key]['StartTime'] == -1 else stat[key]['StartTime']
	

# update lastTime
# update sequences 
def updateStat(stat):
	for key in stat:
		if stat[key]['Updated'] == True:
			stat[key]['LastTime'] =  stat[key]['LastTime']
		else:
			if (stat[key]['StartTime']>=0 and stat[key]['LastTime']>=0):
				stat[key]['Sequences'].append([stat[key]['StartTime'], stat[key]['LastTime']])
			stat[key]['StartTime'] = -1
			stat[key]['LastTime'] = -1
	
	for key in stat:
		stat[key]['Updated'] = False


# get planes statics
ind = 0
print('get stat')
for path in data_files:
	if debug:
		ind += 1
		if ind > maxLen: 
			break
	acList = getAcList(path)
	for ac in acList:
		key = ac['Icao']
		getPlaneStat(ac, stat)
	updateStat(stat)
updateStat(stat)

save_obj(stat, 'stat')

# print(stat, len(stat))


filteredPlane = []

def filterPlanes(plane, stat, filteredPlane):
	# filteredPlane = []
	key = ac['Icao']
	if stat[key]['Count'] < minDataCnt: return
	if stat[key]['TotalTime'] < minTotalTime: return
	if len(stat[key]['Sequences']) < minSequenceCnt: return
	cnt = 0
	for seq in stat[key]['Sequences']:
		if seq[1] - seq[0] >= minSequenceDuration: cnt += 1
	if cnt < minSequenceCnt: return
	filteredPlane.append(key)
	# print(filteredPlane)

# filter planes
print('filter planes')
ind = 0
for path in data_files:
	if debug:
		ind += 1
		if ind > maxLen: 
			break
	acList = getAcList(path)
	for ac in acList:
		key = ac['Icao']
		filterPlanes(ac, stat, filteredPlane)

content = ""
for item in filteredPlane:
	content += item + "\n"

with open(os.path.join(curDirPath, 'filtered-plane.json'), 'w') as f:
	f.write(content)
