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
	function setCellWidth(tableWidth, cell) {
		var cellWidth = 150;
		tableWidth += cellWidth;
		cell.setAttribute("width", cellWidth);
	}
	function createBuildingTable() {
		var buildingTypeSelect = document.getElementById("buildingtypeselect");
		var tableWidth = 150;
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		document.getElementById("infotablediv").appendChild(infoTable);
		
		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		setCellWidth(tableWidth, tableFirstCell);
		document.getElementById("headRow").appendChild(tableFirstCell);
		
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingNameCell = th();
			setCellWidth(tableWidth, buildingNameCell);
			var buildingNameTextNode = txt(building.displayName);
			buildingNameCell.appendChild(buildingNameTextNode);
			document.getElementById("headRow").appendChild(buildingNameCell);
		})
		
		infoTable.setAttribute("width", tableWidth);
		
		var energyProductionRow = tr();
		energyProductionRow.setAttribute("id", "energyProductionRow");
		document.getElementById("infotable").appendChild(energyProductionRow);
		
		var energyProductionRowFirstCell = td();
		if(buildingTypeSelect.value == "energy")
			energyProductionRowFirstCell.appendChild(txt("Energy Production"));
		else
			energyProductionRowFirstCell.appendChild(txt("Energy Consumption"));
		document.getElementById("energyProductionRow").appendChild(energyProductionRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingenergyProductionCell = td();
			var energyProductionDiv = div();;
			
			if(building.energy != 0) {
				var energyProduction = building.energy;
				energyProduction = beauty(energyProduction);
				energyProductionDiv.appendChild(div(txt(energyProduction + "/s")));
			}
					
			buildingenergyProductionCell.appendChild(energyProductionDiv);
			
			document.getElementById("energyProductionRow").appendChild(buildingenergyProductionCell);
		})
		
		var productionRow = tr();
		productionRow.setAttribute("id", "productionRow");
		document.getElementById("infotable").appendChild(productionRow);
		
		var productionRowFirstCell = td();
		productionRowFirstCell.appendChild(txt("Resource Production"));
		document.getElementById("productionRow").appendChild(productionRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingProductionCell = td();
			var resourceProductionDiv = div();;
			
			if(buildingTypeSelect.value != "research") {
				for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
					if(building.resourcesProd[resourceCostIndex]>0) {
						var resourceProduction = building.resourcesProd[resourceCostIndex];
						resourceProduction = beauty(resourceProduction);
						resourceProductionDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
						resourceProductionDiv.appendChild(div(txt(resourceProduction + "/s")));
					}
			} else {
				var resourceProduction = building.researchPoint;
				resourceProduction = beauty(resourceProduction);
				resourceProductionDiv.appendChild(div(txt("Research Points:")));
				resourceProductionDiv.appendChild(div(txt(resourceProduction + "/s")));
			}
					
			buildingProductionCell.appendChild(resourceProductionDiv);
			
			document.getElementById("productionRow").appendChild(buildingProductionCell);
		})
		
		var consumptionRow = tr();
		consumptionRow.setAttribute("id", "consumptionRow");
		document.getElementById("infotable").appendChild(consumptionRow);
		
		var consumptionRowFirstCell = td();
		consumptionRowFirstCell.appendChild(txt("Resource Consumption"));
		document.getElementById("consumptionRow").appendChild(consumptionRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingConsumptionCell = td();
			var resourceConsumptionDiv = div();;
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
				if(building.resourcesProd[resourceCostIndex]<0) {
					var resourceConsumption = building.resourcesProd[resourceCostIndex];
					resourceConsumption = beauty(resourceConsumption);
					resourceConsumptionDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
					resourceConsumptionDiv.appendChild(div(txt("-" + resourceConsumption + "/s")));
				}
					
			buildingConsumptionCell.appendChild(resourceConsumptionDiv);
			
			document.getElementById("consumptionRow").appendChild(buildingConsumptionCell);
		})
		
		var costRow = tr();
		costRow.setAttribute("id", "costRow");
		document.getElementById("infotable").appendChild(costRow);
		
		var costRowFirstCell = td();
		costRowFirstCell.appendChild(txt("Resource Cost"));
		document.getElementById("costRow").appendChild(costRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingCostCell = td();
			var resourceCostDiv = div();;
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
				if(building.resourcesCost[resourceCostIndex]>0) {
					var resourcesCost = building.resourcesCost[resourceCostIndex];
					if(resourcesCost >= 1)
						resourcesCost = beauty(resourcesCost);
					else
						resourcesCost = resourcesCost.toExponential(2);
					resourceCostDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
					resourceCostDiv.appendChild(div(txt(resourcesCost)));
				}
					
			buildingCostCell.appendChild(resourceCostDiv);
			
			document.getElementById("costRow").appendChild(buildingCostCell);
		})
		
		var costMultRow = tr();
		costMultRow.setAttribute("id", "costMultRow");
		document.getElementById("infotable").appendChild(costMultRow);
		
		var costRowFirstCell = td();
		costRowFirstCell.appendChild(txt("Resource Multiplier"));
		document.getElementById("costMultRow").appendChild(costRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingCostMultCell = td();
			var resourceCostMultDiv = div();
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
				if(building.resourcesCost[resourceCostIndex]>0)
					if(building.resourcesCost[resourceCostIndex]>0) {
						resourceCostMultDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
						resourceCostMultDiv.appendChild(div(txt(building.resourcesMult[resourceCostIndex])));
					}
					
			buildingCostMultCell.appendChild(resourceCostMultDiv);
			
			document.getElementById("costMultRow").appendChild(buildingCostMultCell);
		})
		
		var environmentRow = tr();
		environmentRow.setAttribute("id", "environmentRow");
		document.getElementById("infotable").appendChild(environmentRow);
		
		var environmentRowFirstCell = td();
		environmentRowFirstCell.appendChild(txt("Environment"));
		document.getElementById("environmentRow").appendChild(environmentRowFirstCell);
		
		buildings.map(function(building) {
			if(building.displayName == "placeholder")
				return;
			
			if(building.type)
				if(building.type != buildingTypeSelect.value)
					return;
				
			var buildingEnvironmentCell = td();
			var environmentDiv = div();;
			
			for(var environmentIndex = 0; environmentIndex<building.environment.length; environmentIndex++)
				environmentDiv.appendChild(div(txt(building.environment[environmentIndex].capitalize() + " planet")));
					
			buildingEnvironmentCell.appendChild(environmentDiv);
			
			document.getElementById("environmentRow").appendChild(buildingEnvironmentCell);
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