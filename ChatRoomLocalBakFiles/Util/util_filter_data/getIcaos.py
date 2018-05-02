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

# l = len(data_files)
l = conf['length']
record = [{}] * l


def plane_filter(ac, city):
	if 'From' in ac and city in ac['From'] or \
		'To' in ac and city in ac['To']:
		return True
	return False



debug = True
ind  = 0;
maxLen = 1e6;
# maxLen = 5;

"""
get Icao
"""
stat = {}
print('Get Icaos')
print('Total Files: ', l)
for (i,path) in enumerate(data_files):
	if i >= l: break
	if debug:
		ind += 1
		if ind > maxLen: 
			break 
	contents = None
	acList = util.getAcList(path)
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
			'StartTime': -1,
			'StartPos': [999,999],
			'EndPos': [999,999]
		}
	if i and i % 100 == 0: print(i, " files processed.")  


util.save_obj(stat, os.path.join(conf["output_folder"], 'stat_icao'))
print("All files processed.")

