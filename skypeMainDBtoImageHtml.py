#!/usr/bin/env python3

'''
After running "sqlite3 main.db" and pasting
----------------
.mode column
.header on
.output file.txt
select convo_id,chatname,author,timestamp,type,body_xml from messages
where chatname == "karkitty95" and type=201 and author == "karkitty95"
order by id desc;
-----------------
into the console. it will make file.txt.

that is when u run this to make the html file.
'''

from done.File import read,write

s = read("file.txt").replace("imgt1","imgpsh_fullsize")

from re import findall

write("<style>img {height:25%;} a{} div {display:inline}</style>" + '\n'.join('<div><a href=%s><img src= %s /></a></div>'%(i,i) for i in findall('(?<=url_thumbnail=)"[^"]*"',s)),
'links.html')