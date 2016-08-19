class Graph():
    def __init__(self):
        self.dataToo = dict()
        self.dataFom = dict()
    def add(self,tupple):
        too = tupple[0]
        self.dataFom[too] = self.dataFom.get(too,[])
        for ind,fom in enumerate(tupple[:-1]):
            too = tupple[ind+1]
            self.dataToo[fom] = self.dataToo.get(fom,[]) + [too]
            self.dataFom[too] = self.dataFom.get(too,[]) + [fom]
        fom = tupple[-1]
        self.dataToo[fom] = self.dataToo.get(fom,[])
    def levels(self,debug=0):
        too = dict()
        for i,j in self.dataToo.items(): too[i] = set(j)
        scores   = dict( (i,0) for i in too if not len(too[i]) )
        newfound = list( scores.keys() )
        while len(too):
            while len(newfound):
                att = newfound.pop(0)
                too.pop(att)
                num = scores[att]
                for poi in self.dataFom[att]: #find the ones that point to it
                    try: too[poi].remove(att)
                    except KeyError: continue 
                    if not too[poi]: #empty
                        newfound.append(poi)
                        scores[poi] = num+1
                        continue
                    too[poi].add(num)
                    if all(type(i)!=str for i in too[poi]): #no more strings
                        newfound.append(poi)
                        scores[poi] = max( scores[i] for i in self.dataToo[poi] )+1
            if len(too):
                try: num,att = min( (max(k for k in j if type(k)!=str),len([k for k in j if type(k)==str]),i) for i,j in too.items() if any(type(k)!=str for k in j) )[0::2]
                except ValueError as e:
                    if debug: 
                        print("Unfound",too)
                        raise e
                    return scores
                scores[att] = num+1
                newfound = [att]
        return scores
