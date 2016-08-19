data.forEach(function(item) {
	var up, title, text;
	document.body.appendChild(up = document.createElement('div'));
	up.appendChild(title = document.createElement('div'));
	up.appendChild(text = document.createElement('div'));
	
	text.innerHTML = item.tags;
	title.innerHTML = item.title;
	
	up.classList.add('wrap')
	text.classList.add('text');
	title.classList.add('title');
});

function forEach(f) { for (var i=0; i<this.length; i++) { f(this[i], i, this); } }
titles = document.getElementsByClassName('title'); titles.forEach = forEach;
texts = document.getElementsByClassName('text'); texts.forEach = forEach;
spans = document.getElementsByTagName('span'); spans.forEach = forEach;
highlights = document.getElementsByClassName('highlight'); highlights.forEach = forEach;
selected = document.getElementsByClassName('selected'); selected.forEach = forEach;
input = document.getElementById('input');
moveIndex = -1;

function reset() {
	while (spans[0]) { spans[0].parentElement.innerText = spans[0].parentElement.innerText; }
	while (highlights[0]) { highlights[0].classList.remove('highlight'); }
	split = input.value.split(/ +/);
	
	texts.forEach(function(item){
		enough = 0;
		split.forEach(function(str){
			str = str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
			var string = item.innerHTML;
			item.innerHTML = item.innerHTML.replace(new RegExp(str, 'g'), '<span>'+str+'</span>');
			if (item.innerHTML!==string) { enough+=1; }
		});
		if (enough === split.length) {
			item.previousElementSibling.classList.add('highlight');
		}
	});
	
	input.blur();
	moveIndex = -1;
}


function move(ind) {
	if (ind<0 && 0<moveIndex) { moveIndex += ind; }
	if (ind>0 && moveIndex+1<highlights.length) { moveIndex += ind; }
	if (selected.length>0) { selected[0].classList.remove('selected'); }
	highlights[moveIndex].scrollIntoView();
	highlights[moveIndex].classList.add('selected');
}


function print(G, stop) {
	document.body.appendChild(P = document.createElement('p'));
	P.classList.add('text');
	P.innerText = '[';
	G.every(function(i){
		if (i===stop) { return false; }
		P.innerText += '"'+i+'",';
		return true;
	})
	P.innerText += ']';
}

// list = Array();
// data.forEach(function(item){ list = list.concat(item.tags); });
// (function() {
//     var i = list.length,
//         r,
//         item;
//     while (0 !== i) {
//         r = Math.floor(Math.random() * i);
//         i -= 1;
//         item = list[i];
//         list[i] = list[r];
//         list[r] = item;
//     }
// })();
//
// good = ["Addertooth","Alfie","Amber","Amberpaw","Amberstor","Amberstorm","Amberstream","Aren","Argh","Ashbreeze","Ashkit","Assassin","Azotar","Badgerstirke","Badgerstrike","Badgerstripe","Berryleaf","Beta","Betas","Birdflight","Birds","Blackkit","Blackpelt","Blackpetal","Blackstar","Blacstar","Blizzard","Blue","Bluefeather","Blueflash","Bluekit","Bluepaw","Bluepool","Boltkit","Book","Bramble","Bramblekit","Bramblepaw","Brambles","Brambletail","Bramlekit","Braveclaw","Braveheart","Bravekit","Bravepaw","Bravery","Bravestar","Breath","Breeze","Bright","Brightpaw","Brightpelt","Brindleleaf","Brisa","Brokenstar","Brother","Brotherhood","Brothers","Brown","Brownpaw","Buanair","Burntkit","Buzzsaw","Cadeno","Calender","Carlisle","Cars","Catena","Cedarflame","Chapter","Cheetahfur","Cherryblossom","Cherrytail","Cinder","Cinderpelt","Cindertail","Claw","Claws","Cloud","Cloudkit","Cloudlight","Cloudpaw","Cloudpawpaw","Clouds","Cloudstar","Cloudstreak","Cloustreak","Cloverkit","Cloverpaw","Clovertail","College","Colmil","Commander","Commanders","Congratulations","Conica","Cottonkit","Cottonpaw","Cura","Curing","Damid","Daniel","Dapplefur","Dark","Darkkit","Darkness","Darkpaw","Dawn","Dawnpelt","Dawnstripe","Demofang","Demomfang","Demon","Demonaw","Demonfang","Demonkit","Demonpaw","Demons","Deputies","Dewdrop","Dirtpaw","Disobeying","Dorturrang","Dreamworld","Dusk","Duskfeather","Duskfeathers","Duskkit","Duskkits","Duskpaw","Duskshadow","Dustkit","Eagleshade","Eceltri","Echoscreech","Emeraldpaw","Erin","Evecri","Evectri","Falconclaw","Falconpaw","Faliva","Falivia","Fear","Featherflight","Featherpaw","Ferg","Finally","Fire","Firepaw","Firesoul","Firestar","Fishpelt","Flame","Flamecloud","Flamepaw","Flamepelt","Flamestar","Flash","Flock","Flowerkit","Flowernose","Flowerpaw","Flowers","Following","Forest","Foxkit","Foxpaw","Frost","Frostfur","Frostkit","Frostpaw","Geez","Generations","Goldenkit","Grassfur","Grasskit","Green","Greencough","Greenleaf","Grey","Greykit","Greypelt","Growing","Haha","Harefrost","Harestar","Haretail","Harley","Harry","Haven","Hawk","Hear","Helador","Hell","Hello","Highrock","Holiday","Hollyblaze","Honey","Honourable","Hunter","Hunters","Hunting","Huntress","Intono","Iveria","Ivyclaw","Jack","Jackie","Jactur","Jacutr","Jayflight","Jayfrost","Jaykit","June","Kien","Kies","King","Kings","Kittypet","Klan","Knowing","Kreis","Ladia","Laida","Laidia","Last","Latin","Leona","Leopard","Leopardclaw","Leopardleap","Leopardpaw","Leopardsclaw","Leopardspot","Leslie","Lightbreeze","Lighten","Lighting","Lightkit","Lightning","Lightwing","Lillykit","Lilyear","Lilyflame","Lilypaw","Lion","Lionfang","Lionkit","Lionpaw","Liontail","Lone","Loner","Loners","Lord","Luca","Lucio","Luciraya","Maplefeather","Maplekit","Maplepaw","Mata","Matar","Mater","Matt","Matted","Matthew","Meanwhile","Meliso","Memories","Midnight","Mistpaw","Mofeta","Moon","Moonpool","Moons","Moreno","Morningbreeze","Mosskit","Mosspaw","Movement","Mudkit","Mudpaw","Mudroot","Mysticfall","Mysticpaw","Near","Needlekit","Negro","Night","Nightclaw","Nightfall","Nightflake","Nightfrost","Nightkit","Nightmares","Nightmist","Nightpaw","Nightstar","Nighty","Nineteen","Nixcro","Noctazul","Nope","Noxtactis","Oakkit","Oakpaw","Oculicatis","Oddpaw","Oliver","Oops","Operio","Opposites","Otternose","Ouch","Outcast","Patrols","Pebble","Pebblestorm","Pikefur","Pinekit","Pineneedlekit","Pineshade","Pinipy","Poppyheart","Prince","Princes","Princess","Puddlefoot","Rain","Rainey","Rainfur","Rainmoon","Rainpaw","Rainstar","Rainy","Ravenblaze","Ravenstar","Razavi","Reciovient","Redflash","Redfur","Redpaw","Redstar","Reed","Reedfeather","Reefeather","Ripple","River","RiverCan","RiverClan","Riverstar","Rivio","Rizar","Robinpaw","Robinwing","Rogue","Rogues","Romeo","Rose","Rosefire","Rosestar","Rubblepaw","Runningclaw","Runningpaw","Runtkit","Russetfoot","Rustles","Saga","Sana","Sandkit","Sandstar","Santus","Sarza","Satan","Scorched","Scorchkit","Scorchspot","Selios","Seven","Seventeen","ShadeClan","Shadow","ShadowClan","Shadowflame","Shadowkit","Shadowpaw","Shadows","Shadowstar","Shadowstrike","Sharpfang","Sharpkit","Sharpmoon","Sharppaw","Sharpstar","Showing","Shred","Silent","Sileo","Silverdew","Silverpelt","Silvershine","Single","Sinner","Siseo","Skips","Skyfur","Skyhunter","Smallkit","Smoke","Smokekit","Smokepaw","Smokestar","Smoketail","Snake","Snakeheart","Snakestar","Snowbranch","Snowclaw","Snowdrift","Snowflakekit","Snowfur","Snowkit","Snowpaw","Snowshine","Snowstorm","Softheart","Softstreak","Softwillow","Sparrowbreeze","Spiderkit","Spiderleap","Spiderpaw","Splashpaw","Spottedfoot","Spottedfur","Springfur","Squirrelwhisker","StarCan","StarClan","Stars","Stephen","Stephens","Stonefur","Storm","StormClan","Stormheart","Stormkit","Stormpaw","Storms","Stormstar","Stormtail","Stormy","Stripeclaw","Subir","Sunday","Sundown","Sunpaw","Sweet","Sweetclaw","Sweetie","Sweetkit","Sweetpaw","Swift","Swiftfeather","Swiftheart","Swiftpaw","Swiftstrike","Swords","Taekwondo","Talontooth","Talontoothand","Tanzen","Tavo","Tawnyfoot","Tear","Thistleclaw","Thorn","Thornkit","Thornpaw","Thornta","Thorntail","Thousands","Thrushpaw","ThunderClan","Thunderheart","Thunderpath","Thunderstar","Thunderstrike","Tide","Tiger","Tigerfang","Tigerkit","Tigerpaw","Tigerpelt","Tigerstar","Tigertail","Tinyear","Tireana","Tree","Treefoot","Treekit","Treeleg","Treepaw","Tribe","Tribes","Twigpaw","Twoleg","Twolegs","Vampire","Venom","Venturing","Vidius","Volan","Volans","Waffles","Warrior","Warriors","Warriorship","Water","Waterleg","Webbedfoot","White","Whitestream","Willowbreeze","Willowpaw","Willowshade","Willowstar","WindClan","Windstar","Wint","Winter","Wolfheart","Wolfstar","Yelloweye","Yellowstreak","Zinder"];
// bad = Array()
//
// while (list.length > 0) {
// 	str = list.pop();
// 	if (!good.some(function(i) {return i===str}) && !bad.some(function(i) {return i===str})) {
// 		if (['kit','star','paw','heart','moon'].some(function(i) { return str.substr(str.length-i.length)===i })) {
// 			good.push(str);
// 		}
// 		if (confirm('Is '+str+" a good word?")) {
// 			good.push(str);
// 		} else {
// 			bad.push(str);
// 		}
// 	}
// }
//
// print(good)
// print(bad)