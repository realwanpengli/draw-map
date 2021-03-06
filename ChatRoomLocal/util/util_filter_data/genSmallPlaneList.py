import pickle 
import os 
import json 
import math 
import util 

conf = util.load_conf()

path = os.path.join(conf["output_folder"], 'filtered-plane.json')
output_path = os.path.join('../../wwwroot/data/tcp-aircraft-small.json')
filteredKeys = util.load_json(path)

print(len(filteredKeys))

matrix = util.load_json('C:/Users/wanl/Documents/microsoft/dataset/adsbexchange/generated_dataset/tcp-aircraft.json')

newMatrix = []
for i, aclist in enumerate(matrix):
    newMatrix.append([])
    for j, ac in enumerate(aclist):
        if ac['Icao'] in filteredKeys and ac['Lat'] >= -90 and ac['Lat'] <= 90 \
            and ac['Long'] >= -180 and ac['Long'] <= 180: 
            newMatrix[-1].append(ac)
    print('len = ', len(matrix[-1]))

util.save_json(output_path, newMatrix)
util.save_json('../../wwwroot/wwwroot/data/tcp-aircraft-small.json', newMatrix)