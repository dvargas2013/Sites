#!/usr/bin/env python3

from done.File import siteRead, write

OAuthConsumer = {
'Key':'az3aMQauHx08Aey3r1DgGKDA4CQF4OSQHTXRq4hUuSaVlXkpsS',
'Secret':'y9MqsIRhnFkwu9mx9IJpD1Z2A8h5hTXtOt0AmYbouKFwIdvUgM' 
}
OAC = OAuthConsumer

def translate(tumblr,shift=0):
    if tumblr.endswith('/'): tumblr=tumblr[:-1]
    red = siteRead( 'https://api.tumblr.com/v2/blog/%s/posts?offset=%s&api_key=%s'%(tumblr,shift,OAC["Key"]) )
    red = red.replace('null','None').replace('true','True').replace('false','False').replace('\/','/')
    return eval(red).get("response")

ppars=lambda p,n: repr({
    "Name": p.get("reblogged%sname"%n,None),
    "URL": p.get("reblogged%surl"%n,None),
    "ID": int(p.get("reblogged%sid"%n,-1)),
    "UUID": p.get("reblogged%suuid"%n,None)
}) if p.get("reblogged%sname"%n,False) else None

line=lambda p,n: '\t%s:{"Kind":%s,"Tags":%s,"Date":%s,"link":%s,"Name":%s,"reblobKey":%s,"Title":%s,"RootTitle":%s,"Comment":%s,"NoteCount":%s,"Root":%s,"From":%s},'%(
        p['id'],
        repr(p['type']),
        p['tags'],
        repr(p['date']),
        repr(p['post_url'].replace(n,'').replace(p['slug'],'')),
        repr(p['slug']),
        repr(p['reblog_key']),
        repr(p.get('title',None)),
        repr(p.get("reblogged_root_title",None)),
        repr(p.get('reblog',{}).get('comment',None)),
        p['note_count'],
        ppars(p,"_root_"),
        ppars(p,"_from_")
)

def main(tumblr='dansan1234567',shift=0,end=131072,outfile='txt.py',cont=False):
    if '.' not in tumblr: tumblr+='.tumblr.com'
    s = translate(tumblr,shift)
    relative = s['posts'][0]['post_url'].split('/post/')[0]
    if not cont: write('linkAdd="%s"\nsub={\n'%relative,outfile,tag='w')
    write('\n#%s-%s\n'%(shift,shift+20) + '\n'.join(line(p,relative) for p in s['posts']),outfile,'a')
    s = (s['total_posts']-shift)//20*20+shift
    print(tumblr)
    print("\r%s/%s complete"%(shift,s),end="")
    try:
        stop = min(s+1, shift+20 + 20*end)
        for i in range(shift+20,stop,20):
            write('\n#%s-%s\n'%(i,i+20) + '\n'.join(line(p,relative) for p in translate(tumblr,i)['posts']),outfile,tag='a',encoding="utf-8",onerror='xmlcharrefreplace')
            print("\r%s/%s complete"%(i,s),end="")
    except KeyboardInterrupt: pass
    finally: write('}',outfile,'a')
    print("")

from html.parser import HTMLParser
class CommentParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.data = []
    def handle_data(self, data):
        self.data.append(data)
def parseComment(html):
    parser = CommentParser()
    parser.feed(html)
    return ' '.join(parser.data)