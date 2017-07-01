var hsv2rgb = function(h,s,v) {
var r,g,b;
if (s === 0) { r=g=b=v; } else {
var a,b,c;
h /= 60;
c = Math.floor(h);
a = v*(1-s);
b = v*(1-s*(h-c));
c = v*(1-s*(1-(h-c)));
switch(i) {
case 0:  r=v; g=c; b=a; break;
case 1:  r=b; g=v; b=a; break;
case 2:  r=a; g=v; b=c; break;
case 3:  r=a; g=b; b=v; break;
case 4:  r=c; g=a; b=v; break;
default: r=v; g=a; b=b; break;
}
}
return '#' + [r,g,b].map(function(x){ 
return ("0" + Math.round(x*255).toString(16)).slice(-2);
}).join('');
};