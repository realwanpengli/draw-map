import os
import glob
import json
import pickle
import math

curDirPath = os.path.dirname(__file__)
data_folder_path = os.path.join(curDirPath, '..', 'data', '*.json')
print(data_folder_path)

data_files = glob.glob(data_folder_path)

def save_obj(obj, name ):
    with open(name + '.pkl', 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

def getAcList(path):
	contents = None
	with open(path, 'r', encoding='UTF-8') as f: contents = f.read()  
	j = json.loads(contents)
	acList = j['acList']
	return acList



def getPlaneStat(plane, stat):
	if 'PosTime' not in plane: return
	key = plane['Icao']
	lastTime = stat[key]['LastTime']
	curTime = plane['PosTime']
	curPos = [plane['Lat'], plane['Long']]
	stat[key]['Updated'] = True
	duration =  curTime - lastTime if lastTime >= 0 else 0
	stat[key]['TotalTime'] = stat[key].get('TotalTime', 0) + duration
	stat[key]['LastTime'] = curTime
	stat[key]['StartTime'] = curTime if stat[key]['StartTime'] == -1 else stat[key]['StartTime']
	stat[key]['StartPos'] = curPos if stat[key]['StartPos'] == [999,999] else stat[key]['StartPos']
	stat[key]['EndPos'] = curPos

# update lastTime
# update sequences 
def updateStat(stat):
	for key in stat:
		if stat[key]['Updated'] == True:
			stat[key]['LastTime'] =  stat[key]['LastTime']
		else:
			if (stat[key]['StartTime']>=0 and stat[key]['LastTime']>=0):
				dx = stat[key]['StartPos'][0] - stat[key]['EndPos'][0]
				dy = stat[key]['StartPos'][1] - stat[key]['EndPos'][1]
				# dis = math.sqrt(dx*dx + dy*dy)
				stat[key]['Sequences'].append([stat[key]['StartTime'], stat[key]['LastTime'], 
				stat[key]['StartPos'][0],stat[key]['StartPos'][1],
				stat[key]['EndPos'][0],stat[key]['EndPos'][1]])

			stat[key]['StartTime'] = -1
			stat[key]['LastTime'] = -1
	
	for key in stat:
		stat[key]['Updated'] = False


# get planes statics
print('get stat')
stat = load_obj('stat_icao')

for path in data_files:
	acList = getAcList(path)
	for ac in acList:
		key = ac['Icao']
		getPlaneStat(ac, stat)
	updateStat(stat)
updateStat(stat)

save_obj(stat, 'stat')