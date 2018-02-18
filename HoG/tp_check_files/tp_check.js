document.addEventListener("DOMContentLoaded", function() {
	'use strict';
	
	document.getElementById("impsave").onclick = function(){
		importSave();
		update();
	};
	
	function update() {
		document.getElementById("tp_result").innerHTML = "Total TP: " + Math.floor(game.totalTPspent()) + "<br>TP: " + Math.floor(game.techPoints);
	}
	
});

