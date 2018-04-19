import os
import glob
import json

root = '..'
data_folder_path = os.path.join(root, 'ChatRoomLocal', 'data', '*.json');
print(data_folder_path)
data_files = glob.glob(data_folder_path);
Icao = '400802'


"""
palne aln on sea
"""
# for i in range(len(data_files)):
# 	path = data_files[i]
# 	print(path)
# 	with open(path, 'r') as f:
# 		contents = f.read()
# 		j = json.loads(contents)
# 		# print(j)
# 		acList = j['acList']
# 		for ac in acList:
# 			if ac['Icao'] == Icao:
# 				print(Icao, ac['Lat'], ac['Long'], ac['Gnd'])


"""
shanghai 
"""

for i in range(len(data_files)):
	path = data_files[i]
	print(path)
	with open(path, 'r') as f:
		contents = f.read()
		j = json.loads(contents)
		# print(j)
		acList = j['acList']
		keyword = 'Shanghai'
		for ac in acList:
			if 'Form' in ac and keyword in ac['From'] or 'To' in ac and keyword in ac['To']:
				if 'Lat' in ac and 'Long' in ac:
					print(ac['Icao'], ac['Lat'], ac['Long']) 