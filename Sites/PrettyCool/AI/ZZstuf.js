$.post("../includes/get_code.php",{player:window.location.search.split('opp=')[1],game:window.location.pathname.substring(1,window.location.pathname.length-1)},function(e){console.log(e);})