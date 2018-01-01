document.addEventListener("DOMContentLoaded", function() {
	'use strict';
	
	function arr(v) { return Array.prototype.slice.call(v); }
	function appendTo(a) { return function(b) { return a.appendChild(b); }; }
	function el(tag, contents) { var el = document.createElement(tag); if(contents) contents.map(appendTo(el)); return el; }
	function txt() { return document.createTextNode(arr(arguments).join()); }
	function div() { return el("div", arr(arguments)); }
	function span() { return el("span", arr(arguments)); }
	function label() { return el("label", arr(arguments)); }
	function tr() { return el("TR", arr(arguments)); }
	function td() { return el("TD", arr(arguments)); }
	function th() { return el("TH", arr(arguments)); }
	
	function deleteTable() {
		var infoTableDiv = document.getElementById("infotablediv");
		while(infoTableDiv.lastChild)
			infoTableDiv.removeChild(infoTableDiv.lastChild);
	}
	function createBuildingTable() {
		var buildingTypeSelect = document.getElementById("buildingtypeselect");
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		document.getElementById("infotablediv").appendChild(infoTable);

		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		document.getElementById("headRow").appendChild(tableFirstCell);
		
		
		buildings.map(function(building){
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingNameCell = th();
			var buildingNameTextNode = txt(building.displayName);
			buildingNameCell.appendChild(buildingNameTextNode);
			document.getElementById("headRow").appendChild(buildingNameCell);
		})
		
		var costRow = tr();
		costRow.setAttribute("id", "costRow");
		document.getElementById("infotable").appendChild(costRow);
		
		var costRowFirstCell = td();
		costRowFirstCell.appendChild(txt("Resource Cost"))
		document.getElementById("costRow").appendChild(costRowFirstCell);
		
		buildings.map(function(building){
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingCostCell = td();
			var resourceCostString = "";
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
				if(building.resourcesCost[resourceCostIndex]>0)
					resourceCostString += resources[resourceCostIndex].name.capitalize() + ": " + beauty(building.resourcesCost[resourceCostIndex]) + "\n";
					
			var buildingNameTextNode = txt(resourceCostString);
			buildingCostCell.appendChild(buildingNameTextNode);
			
			document.getElementById("costRow").appendChild(buildingCostCell);
		})
		
	}
	function createResearchTable() {
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		document.getElementById("infotablediv").appendChild(infoTable);

		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		document.getElementById("headRow").appendChild(tableFirstCell);
		
	}
	function createShipTable() {
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		document.getElementById("infotablediv").appendChild(infoTable);

		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		document.getElementById("headRow").appendChild(tableFirstCell);
		
	}
	function createinfoSelectionList() {
		var infoSelect = el("select");
		infoSelect.setAttribute("id", "infoselect");
		["buildings", "researches", "ships"].map(function(infoSelectionList) {
			var option = el("option");
			option.value = infoSelectionList;
			option.innerText = infoSelectionList.capitalize();
			return option;
		}).map(appendTo(infoSelect));
		infoSelect.lastSelected = "";
		
		document.getElementById("info_selection_list").appendChild(span(infoSelect));
	}
	function createbuildingtypeselect() {
		var buildingTypes = {
			mining: "Extraction",
			prod: "Production",
			energy: "Energy",
			research: "Research Buildings",
			other: "Other Buildings",
		}
		var buildingselect = el("select");
		buildingselect.setAttribute("id", "buildingtypeselect");
		["mining", "prod", "energy", "research", "other"].map(function(infoSelectionList) {
			var option = el("option");
			option.value = infoSelectionList;
			option.innerText = buildingTypes[infoSelectionList];
			return option;
		}).map(appendTo(buildingselect));
		
		document.getElementById("info_selection_list").appendChild(span(buildingselect));
	}
	function removebuildingtypeselect() {
		var infoSelectionList = document.getElementById("info_selection_list");
		infoSelectionList.removeChild(infoSelectionList.lastChild);
	}
	function checkbuildingtypeselect(infoSelect) {
		return infoSelect.lastSelected == "buildings" && infoSelect.lastSelected != infoSelect.value;
	}
	
	/*
	game.buildings.map(function(building){
		for(var resourceIndex=0;resourceIndex<resNum;resourceIndex++){
			var resourceFirstPlanet = true;
			if(0!=building.resourcesProd[resourceIndex]&&(0<building.resourcesProd[resourceIndex])){
				var resource = resources[resourceIndex];
				var buildingResourceRow = tr();
				buildingResourceRow.setAttribute("id", "tr_" + building.id + "_" + resource.id);
				document.getElementById("infotable").appendChild(buildingResourceRow);
				var buildingResourceCell = td();
				var buildingResourceNode = txt(building.displayName + "(" + resource.name.capitalize() + ")");
				buildingResourceCell.appendChild(buildingResourceNode);
				document.getElementById("tr_" + building.id + "_" + resource.id).appendChild(buildingResourceCell);
				planets.map(function(planet){
					var inputCell = td();
					if((0<planet.baseResources[resourceIndex]||"mine"!=building.type2)){
						for(var environmentIndex=0;environmentIndex<building.environment.length;environmentIndex++)
							if(building.environment[environmentIndex]==planet.type){
								var input = el("input");
								input.setAttribute("id", "input_" + planet.id + "_" + building.id + "_" + resource.id);
								input.type = "text";
								input.disabled = !resourceFirstPlanet;
								input.required = resourceFirstPlanet;
								input.value = 0;
								if(saveData.buildingLevels && saveData.buildingLevels["input_" + planet.id + "_" + building.id + "_" + resource.id]) input.value = saveData.buildingLevels["input_" + planet.id + "_" + building.id + "_" + resource.id];
								resourceFirstPlanet = false;
								var planetInput = input;
								inputCell.setAttribute("id", "td_" + planet.id + "_" + building.id + "_" + resource.id);
								inputCell.appendChild(planetInput);
							}
					}
					document.getElementById("tr_" + building.id + "_" + resource.id).appendChild(inputCell);
				})
			}
		}
	})
	*/
	createinfoSelectionList();

	window.onpopstate = function() {
		update();
	};
	
	var update = document.getElementById("infotool").onchange = function() {
		var infoSelect = document.getElementById("infoselect");
		var infoSelected = infoSelect.value;
		if(infoSelected == "buildings") {
			if(infoSelect.lastSelected != infoSelect.value)
				createbuildingtypeselect();
			deleteTable();
			createBuildingTable();
			
		}
		if(infoSelected == "researches") {
			if(checkbuildingtypeselect(infoSelect))
				removebuildingtypeselect();
			deleteTable();
			createResearchTable();
			
		}
		if(infoSelected == "ships") {
			if(checkbuildingtypeselect(infoSelect))
				removebuildingtypeselect();
			deleteTable();
			createShipTable();
			
		}
		/*
		game.buildings.map(function(building){
			for(var resourceIndex=0;resourceIndex<resNum;resourceIndex++){
				var resourceFirstPlanet = true;
				var resourceCostInput = Array(resNum);
				var buildingLevel;
				if(0!=building.resourcesProd[resourceIndex]&&(0<building.resourcesProd[resourceIndex])){
					var resource = resources[resourceIndex];
					planets.map(function(planet){
						if((0<planet.baseResources[resourceIndex]||"mine"!=building.type2)){
							for(var environmentIndex=0;environmentIndex<building.environment.length;environmentIndex++)
								if(building.environment[environmentIndex]==planet.type){
									var input = document.getElementById("input_" + planet.id + "_" + building.id + "_" + resource.id);
									if(resourceFirstPlanet){
										buildingLevel = input.value;
										for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
											resourceCostInput[resourceCostIndex] = Math.floor((building.resourcesCost[resourceCostIndex]*Math.pow(building.resourcesMult[resourceCostIndex],buildingLevel))/planet.baseResources[resourceIndex]);
										resourceFirstPlanet = false;
									} else {
										var efficientBuildingLevels = [];
										for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++){
											if(resourceCostInput[resourceCostIndex]==0) continue;
											var efficientBuildingLevel = 0;
											var resourceCost = Math.floor(building.resourcesCost[resourceCostIndex]*Math.pow(building.resourcesMult[resourceCostIndex],efficientBuildingLevel));
											while((resourceCostInput[resourceCostIndex]*planet.baseResources[resourceIndex])>resourceCost){
												resourceCost = Math.floor(building.resourcesCost[resourceCostIndex]*Math.pow(building.resourcesMult[resourceCostIndex],efficientBuildingLevel));
												efficientBuildingLevel++;
											}
											if(efficientBuildingLevel>0) efficientBuildingLevel -= 1;
											efficientBuildingLevels.push(efficientBuildingLevel);
										}
										var newBuildingLevel = Math.min.apply(null, efficientBuildingLevels);
										input.value = newBuildingLevel;
									}
								}
						}
					})
				}
			}
		})*/
		infoSelect.lastSelected = infoSelect.value;
	}
	update();
});