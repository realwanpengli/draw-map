import os
import glob
import json

curDirPath = os.path.dirname(__file__)

data_folder_path = os.path.join(os.getcwd(), '..', 'data', '*.json');
print(data_folder_path)

data_files = glob.glob(data_folder_path)
plane_list = ['405A48', '400A25', '40095D', '010160', '3C6643','40097E', '4CA215', '40701B', '3991E5', '406531'];

l = 60;
record = [{}] * l;
print(record)
print('data_files len', len(data_files))
for i in range(len(data_files)):
	if i >= l:
		break
	path = data_files[i]
	print(path)
	contents = None
	with open(path, 'r', encoding='UTF-8') as f:
		contents = f.read()
	j = json.loads(contents)
	acList = j['acList']
	tmp = []
	for ac in acList:
		if ac['Icao'] in plane_list:
			# print(i, ac.get('Icao', '000000'))
			tmp.append({ 
				'Icao': ac.get('Icao', '000000'),
				'Lat' : ac.get('Lat', 0.),
				'Long': ac.get('Long', 0.),
				'Gnd': ac.get('Gnd', False),
				'From': ac.get('From', ''),
				'To': ac.get('To', '')
			});
	record[i] = tmp
	# print(record)
				

with open(os.path.join(curDirPath, 'london-aircraft.json'), 'w') as f:
	f.write(json.dumps(record))	
