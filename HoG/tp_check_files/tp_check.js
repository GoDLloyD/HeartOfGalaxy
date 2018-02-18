document.addEventListener("DOMContentLoaded", function() {
	'use strict';
	
	document.getElementById("impsave").onclick = function(){
		var errorMessageDiv = document.getElementById("importError");
		importSave(errorMessageDiv);
		update();
	};
	
	function update() {
		document.getElementById("tp_result").innerHTML = "Total TP: " + Math.floor(game.totalTPspent()) 
		+ "<br>TP: " + Math.floor(game.techPoints) 
		+ "<br>TP after Time Travel: " + Math.floor(game.totalTPspent()+2*game.influence()*Math.log(1+game.totalRPspent()/(200*bi))/Math.log(5));
	}
	
});

