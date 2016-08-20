#!/usr/bin/env python3
from Chain import Chain,closest
from os import sys
def read(file, tag='r'):
    try: 
        with open(file,tag) as f: return f.read()
    except: 
        with open(file,tag,encoding='latin_1') as f: return f.read()
def main(name,words):
    sys.stdout.write(
        Chain(
            read("Cache/"+name+'.txt')
        ).generate(
            ask=words,
            relationdepth=6,
            lencutoff=60,
            timeout=10
        )+"\n"
    );
if __name__ == '__main__':
    main(sys.argv[1],sys.argv[2])