#!/usr/bin/env python3
'''
Creates the urName.js and urName.txt according to urName 
so that display.html and display.js can do its magic

the thing that takes longest is loading the watchers non mutuals
cause there is no way to batch find the user images. 
unless i start using the api which i refuse to do.

SOOO. i created a temp watcher thing named urName.txt just for that purpose
Also it technically saves the information im looking for in urName.js anyway 
but it might be outdated ... but honestly i dont care about the icons of watchers that much
also if the data type is the same dA will update it anyway
'''

from sys import argv
urName = argv[-1]
atATime = 50 #Max 100: Optimally it would be best to be 100 but then there are no overlap checks

from urllib.request import urlopen
def openSite(url):
    if not url.startswith('http'): url='http://'+url
    for i in range(3):
        try: return urlopen(url).read().decode()
        except: sleep(3)
from time import sleep
def waitForSite(url):
    while 1:
        try: return openSite(url)
        except:
            print("Network Error: Sleeping for 10 seconds")
            sleep(10)
            print("Retrying...")
    
#Read the sites
site='http://'+urName+'.deviantart.com/modals/{}/?offset=%s'
def getWatchers():
    i=0
    saved = set()
    while True: #TODO dA changed format . maybe it's time i use the api ...
        s = waitForSite(site.format('watchers')%i).split('<span class="username-with-symbol')[1:]
        for line in s:
            sub = 'href="http://'
            a=line.find(sub)+len(sub)
            b=line.find('.',a)
            
            save = line[a:b] #THE NAME OF THE PERSON
            if save not in saved: saved.add(save)
        if len(s)==100: i+=atATime
        else: break
    return saved
def getFriends():
    i = 0
    saved = set()
    while True:
        s = waitForSite(site.format('myfriends')%i).split('<a target="_blank"')[1:]
        for line in s:
            sub = 'href="http://'
            a=line.find(sub)+len(sub)
            b=line.find('.',a)

            sub = 'src="'
            c=line.find(sub)+len(sub)
            d=line.find('"',c)

            save = line[a:b],line[c:d] #THE NAME AND IMG SRC OF THE PERSON
            if save not in saved: saved.add(save)
        if len(s)==100: i+=atATime
        else: break
    return saved

FList = getFriends()
WList = getWatchers()

Info = dict()
Fset = set()
for name,src in FList:
    Info[name]=src
    Fset.add(name)
Wset = set(WList)

Followed = Fset.difference(Wset)
Mutuals  = Fset.intersection(Wset)
Watchers = Wset.difference(Fset)

line = lambda x,y: "\t{name: '%s', src: '%s'},"%(x,y)
def write(s,file='current/'+urName+".js",tag='a'):
    with open(file,tag) as f: f.write(s+'\n')
def findSRC(name,string='http://%s.deviantart.com/activity/'):
    try:
        content = openSite(string%name)
        sub = '<img class="avatar float-left" src="'
        a = content.find(sub)+len(sub)
        b = content.find('"',a)
        print(name+" Added")
        return content[a:b]
    except: pass
    try:
        if string.endswith('/'):
            print("Retrying "+name)
            return findSRC(name,string='http://%s.deviantart.com')
    except: pass
    print('Error: '+name)
    return 'http://a.deviantart.net/avatars/default.gif'

def read(temp=urName+".txt"):
    with open(temp) as f: return f.read() 
from os.path import exists
import re

def parseInfo(file):
    inside = read(file)
    inside = inside.replace( re.search('var YOU.+{.+};\n',inside).group(), '' )
    return re.split('\nvar.+\n',inside) #Split on lines with ' \n var ... \n '
def parseOld(file = 'current/'+urName+".js"):
    if not exists(file): return False
    folo,mutu,watc = parseInfo(file)
    finder = re.compile("(?<=name: ').+(?=', src)")
    return set(finder.findall(folo)),set(finder.findall(mutu)),set(finder.findall(watc))

try:
    folo,mutu,watc = parseOld()
    print('follow\n- %s\n+ %s\n\nmutual\n- %s\n+ %s\n\nwatchers\n- %s\n+ %s'%(
        ' - '.join(folo.difference(Followed)),
        ' + '.join(Followed.difference(folo)),
        ' - '.join(mutu.difference(Mutuals)),
        ' + '.join(Mutuals.difference(mutu)),
        ' - '.join(watc.difference(Watchers)),
        ' + '.join(Watchers.difference(watc))
    ))
    print('\n')
    oldParsed = 1
except: oldParsed = 0

inside = ''
if exists(urName+'.txt'): inside = read() #If it was halfway executed this will still be here
elif oldParsed: inside = parseInfo("current/"+urName+".js")[-1] #If it was previously executed it will have this at least

write('var followed=[\n'+'\n'.join(line(name,Info[name]) for name in sorted(Followed))+
    '];\nvar mutuals=[\n'+'\n'.join(line(name,Info[name]) for name in sorted(Mutuals))+
    '];\nvar YOU = '+line(urName,findSRC(urName))[:-1]+';',tag='w')

write('',urName+'.txt',tag='w')
for name in sorted(Watchers):
    if "name: '%s', src: "%name not in inside:
        write(line(name,findSRC(name)),file=urName+".txt")
    else:
        write(re.search("\t.+"+"name: '%s', src: "%name+".+,",inside).group(),file=urName+'.txt')
        #print(name+" Loaded from temp file")
write('var watchers=[\n'+read()+'];')

def mover(file=urName+'.txt',to='Txt/'):
    from os.path import join
    from os import remove,renames
    new = join(to,file)
    if exists(new): remove(new)
    renames(file,new)
mover();

from glob import glob
write("var mains=[%s];"%','.join(['"%s"'%i.replace("current/",'').replace(".js","") for i in glob("current/*.js")]), "main.js",tag="w")