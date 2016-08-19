def siteRead(url):
    if not url.startswith('http'): url='http://'+url
    try: 
        from urllib.request import urlopen
    except: 
        from urllib import urlopen
    return str(urlopen(url).read())

def parseHtml(site):
    text = siteRead(site)
    save = list()
    a = text.find('<title>')+7
    e = text.find('</title>',a)
    save.append(text[a:e])
    a = text.find('>',text.find("story_text",e))+1
    e = text.find('<script>',a)
    save.append(text[a:e])
    return tuple(save)
    
from noList import noList
yesList = set()
safeList = set(['Adder', 'Alfie', 'Amber', 'Aren', 'Argh', 'Assassin', 'Azotar', 'Badger', 'Beta', 'Bird', 'Black', 'Blizzard', 'Blue', 'Book', 'Bramble', 'Brave', 'Breath', 'Breeze', 'Bright', 'Brindle', 'Brisa', 'Brother', 'Brown', 'Buanair', 'Buzz', 'Cadeno', 'Calender', 'Carl', 'Cars', 'Catena', 'Cedar', 'Chapter', 'Cheetah', 'Cherry', 'Cinder', 'Claw', 'Cloud', 'Clover', 'College', 'Colmil', 'Commander', 'Congratulations', 'Conica', 'Cotton', 'Cura', 'Curing', 'Damid', 'Daniel', 'Dapple', 'Dark', 'Dawn', 'Demon', 'Deputies', 'Dewdrop', 'Disobeying', 'Dorturrang', 'Dream', 'Dusk', 'Eagle', 'Eceltri', 'Echo', 'Erin', 'Evecri', 'Evectri', 'Falcon', 'Faliva', 'Falivia', 'Ferg', 'Final', 'Fire', 'Fish', 'Flame', 'Flash', 'Flock', 'Flower', 'Forest', 'Fox', 'Frost', 'Geez', 'Generation', 'Green', 'Grey', 'Haha', 'Hare', 'Harley', 'Harry', 'Haven', 'Hawk', 'Helador', 'Hell', 'High', 'Holiday', 'Holly', 'Honey', 'Honourable', 'Hunt', 'Intono', 'Iveria', 'Jack', 'Jactur', 'Jacutr', 'Jay', 'June', 'Kien', 'Kies', 'King', 'Kitty', 'Klan', 'Kreis', 'Ladia', 'Laida', 'Laidia', 'Last', 'Latin', 'Leona', 'Leopard', 'Leslie', 'Light', 'Lily', 'Lion', 'Lone', 'Lord', 'Luca', 'Lucio', 'Luciraya', 'Mat', 'Meanwhile', 'Meliso', 'Memories', 'Midnight', 'Mist', 'Mofeta', 'Moon', 'Moreno', 'Moss', 'Movement', 'Mud', 'Mystic', 'Negro', 'Night', 'Nineteen', 'Nixcro', 'Noctazul', 'Nope', 'Noxtactis', 'Oculicatis', 'Oliver', 'Oops', 'Operio', 'Opposite', 'Otter', 'Ouch', 'Outcast', 'Patrol', 'Pebble', 'Pinipy', 'Poppy', 'Prince', 'Rain', 'Raven', 'Razavi', 'Reciovient', 'Red', 'Reed', 'Ripple', 'River', 'Rivio', 'Rizar', 'Robin', 'Rogue', 'Romeo', 'Rose', 'Russet', 'Rustles', 'Saga', 'Sana', 'Santus', 'Sarza', 'Satan', 'Scorch', 'Selios', 'Seven', 'Shade', 'Shadow', 'Sharp', 'Shred', 'Silent', 'Sileo', 'Silver', 'Single', 'Sinner', 'Siseo', 'Skips', 'Sky', 'Smoke', 'Snake', 'Snow', 'Soft', 'Spider', 'Squirrel', 'Star', 'Stephen', 'Storm', 'Subir', 'Sun', 'Sweet', 'Swift', 'Sword', 'Taekwondo', 'Talon', 'Tanzen', 'Tavo', 'Thorn', 'Thousands', 'Thunder', 'Tide', 'Tiger', 'Tiny', 'Tireana', 'Tree', 'Tribe', 'Twig', 'Two', 'Vampire', 'Venom', 'Venturing', 'Vidius', 'Volan', 'Waffles', 'Warrior', 'Water', 'White', 'Willow', 'Wind', 'Wint', 'Wolf', 'Yellow', 'Zinder', 'blaze', 'blossom', 'breeze', 'claw', 'dew', 'drift', 'ear', 'eye', 'fall', 'fang', 'feather', 'flame', 'flash', 'flight', 'foot', 'frost', 'fur', 'hand', 'heart', 'kit', 'leaf', 'leg', 'moon', 'nose', 'paw', 'pelt', 'pet', 'rock', 'saw', 'screech', 'shade', 'shine', 'spot', 'star', 'stirke', 'storm', 'streak', 'strike', 'stripe', 'tail', 'tooth', 'whisker', 'willow', 'wing'])
def isSafe(text):
    for i in safeList:
        if i[0].upper()==i[0]:
            if text.startswith(i): return True
        elif text.endswith(i): return True
    return False
'''for i in range(50000):
 s = safeList.pop()
 if not isSafe(s): safeList.add(s)'''    

f = open('/usr/share/dict/web2')
words = f.read()
f.close()

def select(text,noList=noList):
    if len(text)<4: return False
    if text.lower()==text:
        noList.add(text)
        return False
    
    if isSafe(text): 
        yesList.add(text)
        return True
    
    if text.lower() in words or text.lower() in noList:
        noList.add(text)
        return False
    
    return True

def parseText(text, noList=noList):
    from re import findall
    sss = set()
    for i in set(findall(r'[A-Za-z]+', text)):
        if select(i): sss.add(i)
    return sss

def line(title,tags):
    return '\t{title:"%s",tags:%s},\n'%(title,sorted(tags))

chapter = {
    1:'http://www.quotev.com/story/4591998/Book-1-Warriors-Behind-The-Shadows/%s',
    2:'http://www.quotev.com/story/4592132/Book-2-Warriors-The-Servants-Promise/%s'
}
length = {
    1: 41,
    2: 40
}

f = open('yes.js','w')
f.write('data = [\n')
for c in range(1,3):
    for i in range(1,length[c]+1):
        site = chapter[c]%i
        title,text = parseHtml(site)
        text = parseText(text)
        f.write(line(title,text))
f.write('];\n')
f.close()

def near(i): return (i.lower() in words) or (i[1:] in words) or (i[2:] in words) or (i[:-2] in words) or (i[:-1] in words) 
caps = set()
for i in list(noList):
    if i.lower()!=i:
        caps.add(i)
        noList.discard(i)
sorta = set()
for i in list(caps):
    if near(i) and i.lower() in noList:
        sorta.add(i)
        caps.discard(i)


f = open('noList.py', 'w')
f.write('capitalized=set([' + ','.join('"%s"'%i for i in sorted(caps)) + '])\n')
f.write('kindaObvs=set([' + ','.join('"%s"'%i for i in sorted(sorta)) + '])\n')
f.write('noList=set([' + ','.join('"%s"'%i for i in sorted(noList)) + '])\n')
f.write('yesList=set([' + ','.join('"%s"'%i for i in sorted(yesList)) + '])\n')
f.close()