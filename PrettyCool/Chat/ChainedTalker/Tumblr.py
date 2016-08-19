#!/usr/bin/env python3

#TODO This is needelessly complicated
def subFoldr(subFolder="Cache"):
    import os, sys, inspect
    global cmd
    cmd = os.path.realpath(os.path.abspath(os.path.join(os.path.split(inspect.getfile( inspect.currentframe() ))[0],subFolder)))
    if cmd not in sys.path: sys.path.insert(0, cmd)
subFoldr()

class Tumblr():
    from importlib import import_module
    from htmlParse import main,parseComment
    def __init__(self, name, end=1000//20):
        self.name = name
        rety=0
        try: data = Tumblr.import_module(name)
        except: rety=1
        if rety:
            from os.path import join
            Tumblr.main(name,shift=0,end=end,outfile=join(cmd,name+'.py'))
            data = Tumblr.import_module(name)
        self.link = data.linkAdd
        self.keys = list(data.sub.keys())
        self.data = data.sub
    def grab(self,*ids):
        """: returns  {id<int>:<dict>}
id: returns grab()[id] if type(id)==int, see htmlParse main post documentation
id, key: returns grab(id)[key] for keys in "Kind,Tags,Date,Link,Name,reblobKey,Title,RootTitle,Comment,NoteCount,Root,From"
id, key, subkey: returns grab(id,key)[subkey] for keys in "Root,From" and subkeys in "Name,URL,ID,UUID" """
        ids=list(ids)
        if not len(ids): return self.data #YOU WANT THE POST DICT
        idkey = ids.pop(0) 
        if type(idkey)!=int: return None #IDK WHAT UR DOING BRUH
        named = self.data.get(idkey,None)
        if not len(ids) or not named: return named #YOU WANT TUMBLRS POST WITH THAT IDKEY
        named = named.get(ids.pop(0),None)
        if not len(ids) or not named or type(name)!=dict: return named #YOU WANT A FIELD IN POST
        return named.get(ids.pop(0),None) #YOU WANT A SUBFIELD IN POST
    def getComment(self,i):
        c = self.grab(i,"Comment")
        if not c: return c or ''
        return Tumblr.parseComment(c)
    def postWords(self,i): return self.getComment(i)+' '.join(self.grab(i,"Tags"))
    def tagChain(self):
        keys = []
        for i in self.keys:
            a = self.postWords(i)
            if len(a)>0: keys.append((-i,a))
        return ' . '.join(j for i,j in sorted(keys))

def generateText(name = 'dansan1234567'):
    print('Generating: '+name)
    s=' '.join(Tumblr(name).tagChain().split()).encode('utf',"xmlcharrefreplace")
    with open(name+'.txt','wb') as f: f.write(s)

if __name__ == '__main__':
    from sys import argv
    if len(argv) > 1:
        generateText(argv[1])
    else:
        generateText()