#!/usr/bin/env python3

from itertools import product, permutations
def count(number, question):
    i = hart = tiny = 0
    m = min(len(number),len(question))
    n = list(number)[:m]
    q = list(question)[:m]
    while i < len(n):
        if n[i] == q[i]:
            hart += 1; n.pop(i); q.pop(i)
        else: i += 1
    for i in n:
        if i in q:
            q.remove(i); tiny += 1
    return (hart, tiny)

Colors = 8
Boxes = 5

all_pos = ["".join(str(j) for j in i) for i in product(range(Colors),repeat=Boxes)]
#all_pos = ["".join(str(j) for j in i) for i in permutations(range(Colors),r=Boxes)]

def apply_rule(s,h,t):
    global all_pos
    s = "".join(str(int(j)) for j in s)
    
    all_pos = [i for i in all_pos if count(i,s) == (h,t)]
    print(all_pos)

apply_rule('01234',0,3)
apply_rule('56472',0,4)
apply_rule('17546',0,4)
apply_rule('74650',3,0)
apply_rule('23651',2,1)