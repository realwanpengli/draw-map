import os
import glob
import json
import util

conf = util.load_conf()
folder = conf["input_folder"]
print(os.path.join(folder, '*.json'))
data_files = glob.glob(os.path.join(folder, '*.json'))
for path in data_files: print(path)


l = conf['length']
offset = 0
speedup = 1
record = [{}] * l


# print(record)
print('data_files len', len(data_files))


for i in range(len(data_files)):
	if i >= l:
		break
	path = data_files[i*speedup+offset]
	print(path)
	contents = None
	j = None
	with open(path, 'r', encoding='UTF-8') as json_data: j = json.load(json_data)
	acList = j['acList']
	tmp = []

	postime = int(path.split('\\')[-1].split('.')[0])

	cnt = 0
	for ac in acList:
		if 'Lat' in ac and 'Long' in ac:
			tmp.append({ 
				'Icao': ac.get('Icao', '000000'),
				'Lat' : ac.get('Lat', 999.),
				'Long': ac.get('Long', 999.),
				'Gnd': ac.get('Gnd', False),
				'From': ac.get('From', ''),
				'To': ac.get('To', ''),
				'PosTime': postime,
				'Cos': ac.get('Cos', [])
			})
	record[i] = tmp
				
# curDirPath = os.path.dirname(__file__)
with open(os.path.join(conf["output_folder"], 'tcp-aircraft.json'), 'w') as f:
	json.dump(record, f)
