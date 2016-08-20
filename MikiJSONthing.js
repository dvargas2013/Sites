var whitelist = [ "myart","mycosplay",'mymusic','myvoice','me' ];
var perPage = 5;
var postWrapperClass,postWrapperID = "postwrapper";
var nextLoad={},maxLoads={},cache={},posts=[],Pagination=$('#pagi'),timerA,timerB,timerC,sheet,requested={};
(function(){whitelist.forEach(function(d){ nextLoad[d] = 0; maxLoads[d]=-1;}); })();//Initialize nextLoad and maxLoads
//XMLHttpRequest handler. the function will be called when ready
function request(url,func) { var req=new XMLHttpRequest();console.log(url);req.onreadystatechange=function() {if (req.readyState===4 && req.status===200) { func(req); } };req.open('GET',url,true); req.send(); }
//From the cache it can be placed on the page. requests the html of the post needed and updates
function addToCache(url,page){if (requested[url]) return; requested[url]=1;
	request(url,function(req){
		var d=document.createElement("div");d.innerHTML=req.responseText;
		if (postWrapperID) { d.innerHTML = $(d).find('#'+postWrapperID)[0].innerHTML; }
		else if (postWrapperClass) { d.innerHTML = d.getElementsByClassName(postWrapperClass)[0].innerHTML; }
		cache[url] = d.innerHTML;updatePage(page);});}
//from the posts u can organize the direction you want things.
function addToPosts(tag,shift,page) {
	request('/api/read/json?start='+shift*50+'&num=50&tagged='+tag,function(req) {
		var data= JSON.parse(req.responseText.substring(22,req.responseText.length-2));
		maxLoads[tag] = parseInt(data["posts-total"])/perPage;
		if (parseInt(data["posts-total"])<shift*50) { nextLoad[tag]=-1; }
		posts = posts.concat(data.posts);posts.sort(function(a,b){ return b["unix-timestamp"] -  a["unix-timestamp"]; });
		
		clearTimeout(timerA);
		timerA = setTimeout(function(){
			for (var i=perPage*page; i<perPage*(page+1) && i<posts.length; i++) { addToCache(posts[i].url,page); }
		},100);
		updatePage(page);});}
//A few helper functions. the tag one is to check if i need to load the next thing. the yum is those objects i define on top. nextLoad and maxLoads
function canStop(tag,page){ if (nextLoad[tag]<0) return true; for (var i=posts.length-1; i>page*perPage; i--){ if (posts[i].tags.some(function(t){ return t==tag; })) return true; } return false; }
function sumLoad(yum) {if (!yum) yum=nextLoad; var summ=0; for (var key in yum) { summ+=yum[key]; } return summ; }
function anyBelow(yum) { if (!yum) yum=nextLoad; for (var key in yum) { if (yum[key]<0) return true; } return false; }
//update page loads the next set of posts and accumulates data from cache into its div. if it gets all of them it loads it up
function updatePage(page) {
	clearTimeout(timerC);
	timerC = setTimeout(function(){ whitelist.forEach(function(d) { if (!canStop(d,page)) { addToPosts(d,nextLoad[d]++,page);} }); },100);
	var d = document.createElement('div');
	for (var i=page*perPage; i<perPage*(page+1) && i<posts.length; i++) { if (cache[posts[i].url]) { d.innerHTML += cache[posts[i].url]; } else { addToCache(posts[i].url,page); return; } }
	if (postWrapperID) { document.getElementById(postWrapperID).innerHTML = d.innerHTML; }
	else if (postWrapperClass) { document.getElementsByClassName(postWrapperClass)[0].innerHTML = d.innerHTML; }
}
function addLink(inside, classType, page, title) { return $('<a>').html(inside).addClass(classType).attr('onclick','changePage('+page+')').attr('title',title); }
//wrapper for the updatePage thing. pagenum-1 is how it works. the timer here changes the pagination. the css is a simple change that happens only once. also this is wat initializes everything by now
function changePage(pagenum) {
	if (pagenum) { window.history.pushState('',"", '/page/'+pagenum); }
	if (window.location.pathname==='/' || window.location.pathname.startsWith('/page')) {
		var pageNum = parseInt(window.location.pathname.split('/').filter(function(d){return parseInt(d);})[0]) || 1;
		whitelist.forEach(function(d) { if (!canStop(d,pageNum-1)) { addToPosts(d,nextLoad[d]++,pageNum-1);}});
		
		if (!sheet) {sheet = (function() {var style = document.createElement("style");style.appendChild(document.createTextNode(""));document.head.appendChild(style);return style.sheet;})();
		sheet.insertRule('.'+whitelist.reduce(function(d1,d2){return d1+", ."+d2})+' { display:block; }',0);
		sheet.insertRule('.post { display: none; }',0);}
		
		clearInterval(timerB);
		timerB = setInterval(function(){
			if (!anyBelow(maxLoads)) {
				var pagination = $('<div>'), num = Math.ceil(sumLoad(maxLoads));
				if (pageNum>num) changePage(pageNum=num);
				if (pageNum>1) { pagination.append(addLink('&larr;','',pageNum-1,'Previous page')); }
				if (pageNum>2) { pagination.append(addLink(pageNum-2,'jump_page',pageNum-2)); }
				if (pageNum>1) { pagination.append(addLink(pageNum-1,'jump_page',pageNum-1)); }
				pagination.append($('<span>').addClass('current_page').html(pageNum));
				if (num>pageNum) pagination.append(addLink(pageNum+1,'jump_page',pageNum+1));
				if (num>(pageNum+1)) pagination.append(addLink(pageNum+2,'jump_page',pageNum+2));
				if (num>pageNum) pagination.append(addLink('&rarr;','',pageNum+1,'Next page'));
				Pagination.html(pagination.html()); clearInterval(timerB); timerB=undefined;}}, 200);
		updatePage(pageNum-1);
	}}
changePage();