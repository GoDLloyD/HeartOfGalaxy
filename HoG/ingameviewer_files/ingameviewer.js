document.addEventListener("DOMContentLoaded", function() {
	'use strict';
	
	function createSelectionList() {
		if(document.getElementById("categoryselect"))
			return;
		var selectionList = document.getElementById("selectionList");
		
		selectionList.appendChild(createCategorySelection());
	}
	function createCategorySelection() {
		var categoryChooser = el("select");
		categoryChooser.setAttribute("id", "categoryselect");
		
		var selectOption = el("option");
		selectOption.value = -1;
		selectOption.innerText = "Select a category";
		var overviewOption = el("option");
		overviewOption.value = "overview";
		overviewOption.innerText = "Resource Overview";
		var tpOption = el("option");
		tpOption.value = "tp";
		tpOption.innerText = "TP Checker";
		var queueOption = el("option");
		queueOption.value = "queue";
		queueOption.innerText = "Queue Checker";
		
		categoryChooser.appendChild(selectOption);
		categoryChooser.appendChild(overviewOption);
		categoryChooser.appendChild(tpOption);
		categoryChooser.appendChild(queueOption);
		
		categoryChooser.onchange = function() {
			var selectionList = document.getElementById("selectionList");
			var val = categoryChooser.value;
			deleteChildElements(document.getElementById("result"));
			if(val == -1) {
			} else if(val == "overview") {
				selectionList.appendChild(createOverviewSelection());
			} else if(val == "tp") {
				tpCheck();
			} else if(val == "queue") {
				queueCheck();
			}
			var galaxySelect = document.getElementById("galaxyselect");
			if(val != "overview" && galaxySelect)
				galaxySelect.parentNode.removeChild(galaxySelect);
		}
		
		return categoryChooser;
	}
	function createOverviewSelection() {
		var galaxyChooser = el("select");
		galaxyChooser.setAttribute("id", "galaxyselect");
		var galaxyOption = el("option");
		galaxyOption.value = -1;
		galaxyOption.innerText = "Select a galaxy";
		var totalOption = el("option");
		totalOption.value = "all";
		totalOption.innerText = "All Galaxies";
		galaxyChooser.appendChild(galaxyOption);
		galaxyChooser.appendChild(totalOption);
		var addedMaps = [];
		for(var planetIndex=0; planetIndex < planets.length; planetIndex++) {
			var map = planets[planetIndex].map;
			if(!addedMaps.includes(map)) {
				var mapOption = el("option");
				mapOption.value = map;
				mapOption.innerText = nebulas[map].name;
				galaxyChooser.appendChild(mapOption);
				
				addedMaps.push(map);
			}
		}
		
		galaxyChooser.onchange = function() {
			deleteChildElements(document.getElementById("result"));
			if(galaxyChooser.value != -1) {
				overview();
			}
		}
		
		return galaxyChooser;
	}
	function overview() {
	
		var cellWidth = 200;
		var tableWidth = 200;
		
		var overviewTable = document.createElement("TABLE");
		overviewTable.setAttribute("id", "overviewTable");
		document.getElementById("result").appendChild(overviewTable);
		
		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("overviewTable").appendChild(headRow);

		
		var headerCell = th();
		headerCell.setAttribute("width", cellWidth);
		tableWidth += cellWidth;
		var headerTextNode = label(txt("Resource"));
		headerCell.appendChild(headerTextNode);
		document.getElementById("headRow").appendChild(headerCell);
		
		var headerCell = th();
		headerCell.setAttribute("width", cellWidth);
		tableWidth += cellWidth;
		var headerTextNode = label(txt("Amount"));
		headerCell.appendChild(headerTextNode);
		document.getElementById("headRow").appendChild(headerCell);
		
		var headerCell = th();
		headerCell.setAttribute("width", cellWidth);
		tableWidth += cellWidth;
		var headerTextNode = label(txt("Production"));
		headerCell.appendChild(headerTextNode);
		document.getElementById("headRow").appendChild(headerCell);
		
		var galaxyChooser = document.getElementById("galaxyselect");
		
		for(var resourceIndex=0;resourceIndex<resNum;resourceIndex++) {
			
			if(!resources[resourceIndex].show(game))
				continue;
			
			var resource = resources[resourceIndex];
		
			var resourceRow = tr();
			resourceRow.setAttribute("id", "resourceRow" + resource.name);
			document.getElementById("overviewTable").appendChild(resourceRow);
			
			var resourceRowFirstCell = td();
			var resourceLabel = label(txt(resource.name.capitalize()));
			resourceRowFirstCell.appendChild(resourceLabel);
			document.getElementById("resourceRow" + resource.name).appendChild(resourceRowFirstCell);
			
			var totalResources = 0;
			
			for(var l=0;l<game.planets.length;l++)
				if(galaxyChooser.value == "all" || nebulas[galaxyChooser.value].planets.includes(game.planets[l]))
					totalResources += planets[game.planets[l]].resources[resourceIndex];
			
			var resourceRowFirstCell = td();
			var resourceLabel = div(label(txt(totalResources)));
			var resourceLabelBeauty = div(label(txt("(" + beauty(totalResources) + ")")));
			resourceRowFirstCell.appendChild(resourceLabel);
			resourceRowFirstCell.appendChild(resourceLabelBeauty);
			document.getElementById("resourceRow" + resource.name).appendChild(resourceRowFirstCell);
			
			var b = resource.id
			for(var e=52,g=Array(game.buildings.length),h=0;h<game.buildings.length;h++)
				g[h]=0;
			for(var l=0;l<game.planets.length;l++)
				if(galaxyChooser.value == "all" || nebulas[galaxyChooser.value].planets.includes(game.planets[l]))
					for(h=0;h<game.buildings.length;h++)
						0!=game.buildings[h].resourcesProd[b]&&(g[h]+=planets[game.planets[l]].structure[h].number);
			var m=0;
			for(h=0;h<game.buildings.length;h++)
				if(0<g[h]){
					e+=20;
					for(l=0;l<game.planets.length;l++)
						if(galaxyChooser.value == "all" || nebulas[galaxyChooser.value].planets.includes(game.planets[l]))
							m+=game.buildings[h].production(planets[game.planets[l]])[b];
				}
			
			var resourceRowFirstCell = td();
			var resourceLabel = div(label(txt((Math.floor(m*100)/100) + "/s")));
			var resourceLabelBeauty = div(label(txt("(" + beauty(Math.floor(m*100)/100) + "/s" + ")")));
			resourceRowFirstCell.appendChild(resourceLabel);
			resourceRowFirstCell.appendChild(resourceLabelBeauty);
			document.getElementById("resourceRow" + resource.name).appendChild(resourceRowFirstCell);
		}
	
		overviewTable.setAttribute("width", tableWidth);
	
	}
	function tpCheck() {
		document.getElementById("result").innerHTML = "Total TP: " + Math.floor(game.totalTPspent()) 
		+ "<br>TP: " + Math.floor(game.techPoints) 
		+ "<br>TP after Time Travel: " + Math.floor(game.totalTPspent()+2*game.influence()*Math.log(1+game.totalRPspent()/(200*bi))/Math.log(5));
	}
	function queueCheck() {
	
		var cellWidth = 200;
		var tableWidth = 200;
		
		var queueTable = document.createElement("TABLE");
		queueTable.setAttribute("id", "queueTable");
		document.getElementById("result").appendChild(queueTable);
		
		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("queueTable").appendChild(headRow);

		
		var headerCell = th();
		headerCell.setAttribute("width", cellWidth);
		tableWidth += cellWidth;
		var headerTextNode = label(txt("Building/Planet"));
		headerCell.appendChild(headerTextNode);
		document.getElementById("headRow").appendChild(headerCell);
		
		game.planets.map(function(planetIndex) {
			var headerCell = th();
			headerCell.setAttribute("width", cellWidth);
			tableWidth += cellWidth;
			var headerTextNode = label(txt(planets[planetIndex].name));
			headerCell.appendChild(headerTextNode);
			document.getElementById("headRow").appendChild(headerCell);
		});
		
		var queuesRow = tr();
		queuesRow.setAttribute("id", "queuesRow");
		document.getElementById("queueTable").appendChild(queuesRow);
		
		var headerCell = td();
		var headerTextNode = label(txt("Queues"));
		headerCell.appendChild(headerTextNode);
		document.getElementById("queuesRow").appendChild(headerCell);
		
		game.planets.map(function(planetIndex) {
			var queueCell = td();
			var planet = planets[planetIndex];
			for(var queueIndex in planet.queue) {
				var queueTextNode = div(label(txt(buildings[queueIndex].displayName + ": " + planet.queue[queueIndex].n)));
				queueCell.appendChild(queueTextNode);
			}
			document.getElementById("queuesRow").appendChild(queueCell);
		});
	
		queueTable.setAttribute("width", tableWidth);
	}
	
	var isSaveImported = false;
	
	document.getElementById("impsave").onclick = function(){
		var errorMessageDiv = document.getElementById("importError");
		isSaveImported = importSave(errorMessageDiv);
		createSelectionList();
	};
	
});

