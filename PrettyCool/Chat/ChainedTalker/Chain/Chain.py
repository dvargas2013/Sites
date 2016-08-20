#!/usr/bin/env python3
from Graph import Graph
from bisect import bisect
from time import time
from random import random
from math import log

def score(sA,sB):
    sA, sB = sA.lower(), sB.lower()
    aa, bb = len(sA), len(sB)
    if not aa and not bb: return 0
    window = max(aa,bb) // 2 - 1
    if window < 0: window = 0
    aFlags, bFlags = [0]*aa, [0]*bb
    common = 0
    for i, aChar in enumerate(sA):
        lo = i-window if i>window else 0
        hi = i+window+1 if i+window < bb else bb
        for j in range(lo,hi):
            if not bFlags[j] and sB[j]==aChar:
                aFlags[i] = bFlags[j] = True
                common += 1
                break
    if not common: return 0
    k = trans = 0
    for i, aFlag in enumerate(aFlags):
        if aFlag:
            for j in range(k,bb):
                if bFlags[j]: 
                    k = j+1
                    break
            if sA[i]!=sB[j]: trans+=1
    trans /= 2
    common = float(common)
    return ( common/aa + common/bb + (common-trans)/common ) / 3 

def choice(choices): 
    "_( [(1,100),(2,4),(3,1)] ) -> 1 most likely"
    values, weights = zip(*choices)
    total = 0
    cum_sum = []
    for w in weights:
        total += w
        cum_sum.append(total)
    x = random() * total
    i = bisect(cum_sum, x)
    return values[i]
def parser(lis):
    a = dict()
    for i in lis: a[i] = a.get(i,0) + 1
    return a
def closest(lis,word): return max( lis, key = lambda x: score(x.lower(),word.lower()) )

class Chain():
    def __init__(self, string):
        self.data = string
        singles = string.split()
        doubles = [ (singles[i], singles[i+1]) for i in range(len(singles) - 1) if '.' not in (singles[i], singles[i+1]) ]
        triples = [ (singles[i], singles[i+1], singles[i+2]) for i in range(len(singles) - 2) if '.' not in (singles[i], singles[i+1], singles[i+2])]
        singles = [ i for i in singles if '.'!=i ]
        self.singles = parser(singles); self.ls = len(singles); self.ns = max(self.singles.values()); self.ms = log(self.ns+1)/log(2) 
        self.doubles = parser(doubles); self.lp = len(doubles); self.nd = max(self.doubles.values()); self.md = log(self.nd+1)/log(2) 
        self.triples = parser(triples); self.lt = len(triples); self.nt = max(self.triples.values()); self.mt = log(self.nt+1)/log(2) 
    def stringMath(self,string):
        if type(self)!=type(string):
            if type(string)!=str: return False
            s = string.split()
            if len(s)<3: string += " x "*(3-len(s))
            string = Chain(string)
        matchS,matchD,matchT =     [ string.singles[i]*self.singles.get(i,0) #How many times it occurs
        for i in string.singles ], [ string.doubles[i]*self.doubles.get(i,0) #in speech x num happens
        for i in string.doubles ], [ string.triples[i]*self.triples.get(i,0) #in test str
        for i in string.triples ]
        mS=sum(matchS)/len(matchS)/self.ms
        mD=sum(matchD)/len(matchD)/self.md
        mT=sum(matchT)/len(matchT)/self.mt
        return (1+mS)*(1+mD)*(1+mT)*(1+mD)*(1+mT)*(1+mT),  mS, mD, mT, matchS, matchD, matchT
    def related(self,listr):
        if type(listr)==str: listr = (listr,)
        if random()<.5: return choice( (double,amount) for double,amount in self.doubles.items() if any(word in double for word in listr) )
        else: return choice( (triple,amount) for triple,amount in self.triples.items() if any(word in triple for word in listr) )
    def _generate(self,dataToo,depths,repeatcutoff,lencutoff,debug=0):
        def sc(i):
            a = list(self.stringMath(i)[:4])
            while a[-1] == 0: a.pop(-1)
            return a[-1] * (len(a) - 1)
        if debug: print("Graph",depths)
        m = max(depths.values())
        if debug: print("BigM",m)
        strings = dict( (i,sc(i)) for i,j in depths.items() if j==m)
        while strings.keys():
            if debug: print("Measured",[ (i,strings[i]) for i in sorted(strings,key=lambda x: strings[x])[-2:] ])
            lis = choice(strings.items())
            scr = strings.pop(lis)
            fom = lis.split()[-1]
            toos = dataToo[fom]
            if not toos or lis.count( ' '.join(lis.split()[-2:]) ) > repeatcutoff or lis.count(" ") > lencutoff:
                if debug: print("\n\t",scr,lis)
                yield scr,lis
                continue
            for too in set(toos):
                key = lis+" "+too
                if debug: print("\tSentenceMade:",key,end=" ")
                if not strings.get(key,False):
                    strings[key] = sc(key)
                    if debug: print(": Measured",strings[key],end="")
                if debug: print()
            if debug: print()
    def generate(self,ask=None,relationdepth=50,repeatcutoff=1,lencutoff=50,timeout=5,debug=0):
        if not ask: ask = " ".join( choice(self.triples.items()) )
        if debug: print(ask)
        a = Graph()
        for seed in ask.split():
            seed = closest(self.singles.keys(), seed)
            if debug: print(seed)
            for i in range(relationdepth):
                try:
                    seed = self.related(seed)
                    a.add(seed)
                except ValueError: seed = tuple( closest(self.singles.keys(),i) for i in seed )
                if debug: print("\t",seed)
        yay = dict()
        t = time()
        for i,j in self._generate(a.dataToo,a.levels(),repeatcutoff,lencutoff):
            if time()-t > timeout: break
            if debug: print(i,j)
            yay[j] = i
        return choice(yay.items())

if __name__ == '__main__':
    c = Chain("Bruh do you even know how much of a good person I am?")
    print( c.generate() )