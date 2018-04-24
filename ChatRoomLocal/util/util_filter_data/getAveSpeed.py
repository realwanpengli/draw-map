
import util, os

def getAveSpeed(stat):
    aveSpeed = 0
    speedCnt = 0
    for key in stat:
        for seq in stat[key]['Sequences']:
            duration = seq[1]-seq[0]
            distance = util.dis(seq[2], seq[4], seq[3], seq[5])
            # if duration/1000/60 > 30:
                # print('fly time = {} min, dis = {} km, \nsrc({},{}), dest({},{})\n speed = {}km/h\n'\
                # .format(duration/1000/60, distance/1000, seq[2],seq[3],seq[4],seq[5], distance/1000 / (duration/1000/60/60)))
            if duration != 0: 
                speed = distance / duration
            else: speed = 0
            if speed > 0 and duration/1000/60 > 30:
                aveSpeed += speed
                speedCnt += 1
    return aveSpeed / speedCnt

conf = util.load_conf();
stat = util.load_obj(os.path.join(conf["output_folder"], 'stat'))
aveSpeed = getAveSpeed(stat)
print("average speed: {} km/h".format(aveSpeed / 1000. / (1./1000. / 60. / 60.)))
with open(os.path.join(conf['output_folder'], 'ave_speed.txt'), 'w') as f:
    content = "average apeed of flights longer than 30min; unit: m/ms;\n{}".format(aveSpeed)
    f.write(content)


