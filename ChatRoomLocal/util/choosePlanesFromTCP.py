import os
import glob
import json

folder = '..\\..\\tcp\\json'
print(os.path.join(folder, '*.json'))
data_files = glob.glob(os.path.join(folder, '*.json'))
for path in data_files: print(path)

plane_list = ['405A48', '400A25', '40095D', '010160', '3C6643','40097E', '4CA215', '40701B', '3991E5', '406531'];

l = 300
offset = 0
speedup = 1
record = [{}] * l

def plane_filter(ac, plane_list, city):
	if ac['Icao'] in plane_list or \
		'From' in ac and city in ac['From'] or \
		'To' in ac and city in ac['To']:
		return True
	return False


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
		if True or plane_filter(ac, plane_list, 'NewYork'):
			tmp.append({ 
				'Icao': ac.get('Icao', '000000'),
				'Lat' : ac.get('Lat', 0.),
				'Long': ac.get('Long', 0.),
				'Gnd': ac.get('Gnd', False),
				'From': ac.get('From', ''),
				'To': ac.get('To', ''),
				'PosTime': postime,
				'Cos': ac.get('Cos', [])
			})
	record[i] = tmp
	# print(record)
				
curDirPath = os.path.dirname(__file__)
with open(os.path.join(curDirPath, 'tcp-aircraft.json'), 'w') as f:
	json.dump(record, f)
