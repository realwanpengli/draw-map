import os
import glob
import json
import pickle
import math
import util

conf = util.load_conf();
data_folder_path = os.path.join(conf["input_folder"],  '*.json');
print(data_folder_path)

data_files = glob.glob(data_folder_path)

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
				stat[key]['Sequences'].append([stat[key]['StartTime'], stat[key]['LastTime'], 
				stat[key]['StartPos'][0],stat[key]['StartPos'][1],
				stat[key]['EndPos'][0],stat[key]['EndPos'][1]])

			stat[key]['StartTime'] = -1
			stat[key]['LastTime'] = -1
	
	for key in stat:
		stat[key]['Updated'] = False


# get planes statics
print('get stat')
l = conf['length']
print('Total Files: ', l)
stat = util.load_obj(os.path.join(conf["output_folder"], 'stat_icao'))

for i, path in enumerate(data_files):
	if i >= l: break
	acList = util.getAcList(path)
	for ac in acList:
		key = ac['Icao']
		if 'Lat' not in ac or 'Long' not in ac: continue
		if conf["source"] == "TCP": ac["PosTime"] = int(path.split('\\')[-1].split('.')[0])
		# print(ac)
		getPlaneStat(ac, stat)
	updateStat(stat)
	if i and i % 100 == 0: print(i, " files processed.")  
updateStat(stat)

util.save_obj(stat, os.path.join(conf["output_folder"], 'stat'))
print("All files processed.")