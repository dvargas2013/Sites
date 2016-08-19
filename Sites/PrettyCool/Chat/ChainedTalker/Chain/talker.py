#!/usr/bin/env python3
from Chain import Chain,closest
from done.File import read

def main(name = None):
    from glob import glob
    names = [i[6:-4] for i in glob("Cache/*.txt")]
    if not name:
        print(names)
        name = input("Who do you want to talk to? ")
    name = name.split()
    if len(name) == 1:
        name = name[0]
        if "/n" not in name: name = closest(names,name)
        else: name = name[2:]
        print(name)
        c = Chain( read("Cache/"+name+'.txt') )
        r=25;l=30;t=4
        print("/r%s /l%s /t%s"%(r,l,t))
        a = c.generate(relationdepth=r,lencutoff=l,timeout=t)
        print(name,'>>>', a)
        while a and '/quit' not in a:
            a = input("YOU >>> ")
            changed = 0
            if "/r" in a:
                changed = 1
                try:
                    r = int(a.split("/r")[1].split()[0]) 
                    print("word relation depth changed to ",r)
                except Exception as e: print(e)
            if "/l" in a:
                changed = 1
                try:
                    l = int(a.split("/l")[1].split()[0])
                    print("max length changed to ",l)
                except Exception as e: print(e)
            if "/t" in a:
                changed = 1
                try:
                    t = int(a.split("/t")[1].split()[0])
                    print("timeout changed to ",t)
                except Exception as e: print(e)
            if changed: continue
            print(name,'>>>', c.generate(ask=a,relationdepth=r,lencutoff=l,timeout=t))
    else:
        n1,n2 = closest(names,name[0]),closest(names,name[-1])
        print(n1,n2)
        c1,c2 = Chain( read( "Cache/"+n1+'.txt' ) ),Chain( read( "Cache/"+n2+'.txt' ) )
        w = None
        try:
            while 1:
                w = c1.generate(w)
                print(n1,'>>>', w)
                w = c2.generate(w)
                print(n2,'>>>', w)
        except KeyboardInterrupt: pass
    return names
if __name__ == '__main__':
    from sys import argv
    name = ' '.join(argv[1:3])
    try:
        while 1:
            print(main(name))
            name = input("Who do you want to talk to? ")
    except KeyboardInterrupt: pass
    print()