from subprocess import call 
 
l = 300 
offset = 3 
speedup = 3 
 
for i in range(0, 99999): 
    if i >= l: break 
    filename = 'aircraft-{}.json'.format(i*speedup+offset+1) 
    cmd = 'copy "..\\json1\\'+filename+ '" ".\\"' 
    print (cmd) 
    call(cmd, shell=True)