import pickle
import json
import os, math

def save_obj(obj, name ):
    with open(name + '.pkl', 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

def load_conf():
    with open('conf.json') as json_data:
        d = json.load(json_data)
        return d

def load_json(path):
    with open(path, 'r', encoding='UTF-8') as json_data:
        d = json.load(json_data)
        return d

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f)

def getAcList(path):
	contents = None
	j = load_json(path)
	acList = j['acList']
	return acList

def deg2rad(deg):
    return deg * math.pi / 180.0

# unit: meter
def dis(lat1, lat2, long1, long2):
    R = 6371
    dLat = deg2rad(lat2-lat1)
    dLon = deg2rad(long2-long1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
    math.cos(deg2rad(lat1)) * math.cos(deg2rad(lat2)) * \
    math.sin(dLon/2) * math.sin(dLon/2)
    c = 2. * math.atan2(math.sqrt(a), math.sqrt(1.-a))
    d = R * c
    return d * 1000

def hour2ms(x):
    return x * 60 * 60 * 1000

def min2ms(x):
    return x * 60 * 1000

def s2ms(x):
    return x * 1000

def km2m(x):
    return x * 1000