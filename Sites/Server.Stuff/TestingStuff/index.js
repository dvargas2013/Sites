var mygetrequest=new ajaxRequest()
mygetrequest.onreadystatechange=function(){
if(mygetrequest.readyState==4){
if(mygetrequest.status==200){
document.getElementById("result").innerHTML=mygetrequest.responseText
}}}
var namevalue=encodeURIComponent(document.getElementById("name").value),
agevalue=encodeURIComponent(document.getElementById("age").value)
mygetrequest.open("GET","basicform.php?name="+namevalue+"&age="+agevalue,true)
mygetrequest.send()