import json

prettyJ = None

with open('../data/AircraftList.json','r') as f:
    text = f.read()
    j = json.loads(text)
    prettyJ = json.dumps(j, indent=4)
    # print(prettyJ)

with open('./prettyJson.json', 'w') as f:
    f.write(prettyJ)
    
