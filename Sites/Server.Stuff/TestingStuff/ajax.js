function ajaxRequest(){
var _1=["Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
if(window.ActiveXObject){
for(var i=0;i<_1.length;i++){
try{return new ActiveXObject(_1[i])
}catch(e){}}}else{
if(window.XMLHttpRequest){
return new XMLHttpRequest()
}else{return false}}}