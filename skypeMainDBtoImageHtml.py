#!/usr/bin/env python3

'''
select skypename,mood_text from Contacts;
.mode column
.header on
.output file.txt

https://login.skype.com/login
'''

name = 'karkitty95'
limit = 200 # 0 means gimme all of em; any limit is that limit
oldToNew = 0 # true / false

from subprocess import check_output
from done.File import write
from re import findall

s = check_output(["sqlite3","main.db","-batch",
'select convo_id,chatname,author,timestamp,type,body_xml from messages where chatname == %r and type=201 and author == %r order by id '%(name,name) + ('asc' if oldToNew else 'desc') + ((' limit %d'%limit) if limit else '') + ";"])
if type(s) == bytes: s = s.decode()
s = s.replace("imgt1","imgpsh_fullsize")
print(s.split('\n')[0])
write("<style>img {height:25%;} a{} div {display:inline}</style>" + '\n'.join('<div><a href=%s><img src= %s /></a></div>'%(i,i) for i in findall('(?<=url_thumbnail=)"[^"]*"',s)),'links.html')