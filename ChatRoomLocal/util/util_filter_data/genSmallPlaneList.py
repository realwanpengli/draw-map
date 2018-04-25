import pickle 
import os 
import json 
import math 
import util 

conf = util.load_conf()

path = os.path.join(conf["output_folder"], 'filtered-plane.json')
output_path = os.path.join('../tcp-aircraft-small.json')
filteredKeys = util.load_json(path)

print(len(filteredKeys))

matrix = util.load_json('../tcp-aircraft.json')

newMatrix = []
for i, aclist in enumerate(matrix):
    newMatrix.append([])
    for j, ac in enumerate(aclist):
        if ac['Icao'] in filteredKeys: newMatrix[-1].append(ac)

util.save_json(output_path, newMatrix)