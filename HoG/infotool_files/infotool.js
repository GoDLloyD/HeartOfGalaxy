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
	function createPlanetTable() {
		var tableWidth = 150;
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		infoTable.planets = [];
		document.getElementById("infotablediv").appendChild(infoTable);
		
		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		setCellWidth(tableWidth, tableFirstCell);
		document.getElementById("headRow").appendChild(tableFirstCell);
		
		planets.map(function(planet) {
			var planetNameCell = th();
			setCellWidth(tableWidth, planetNameCell);
			var planetNameTextNode = txt(planet.name);
			planetNameCell.appendChild(planetNameTextNode);
			document.getElementById("headRow").appendChild(planetNameCell);
			infoTable.planets.push(planet);
		})
		
		infoTable.setAttribute("width", tableWidth);
		
		var influenceRow = tr();
		influenceRow.setAttribute("id", "influenceRow");
		document.getElementById("infotable").appendChild(influenceRow);
		
		var influenceRowFirstCell = td();
		influenceRowFirstCell.appendChild(txt("Influence"));
		document.getElementById("influenceRow").appendChild(influenceRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetInfluenceCell = td();
			var influenceDiv = div();
			
			influenceDiv.appendChild(div(txt(planet.influence)));
					
			planetInfluenceCell.appendChild(influenceDiv);
			
			document.getElementById("influenceRow").appendChild(planetInfluenceCell);
		})
		
		var unlocksRow = tr();
		unlocksRow.setAttribute("id", "unlocksRow");
		document.getElementById("infotable").appendChild(unlocksRow);
		
		var unlocksRowFirstCell = td();
		unlocksRowFirstCell.appendChild(txt("Unlocks"));
		document.getElementById("unlocksRow").appendChild(unlocksRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetUnlocksCell = td();
			var unlocksDiv = div();
			
			if(planet.unlock)
				unlocksDiv.appendChild(div(txt(researches[researchesName[planet.unlock]].name.capitalize())));
						
			planetUnlocksCell.appendChild(unlocksDiv);
			
			document.getElementById("unlocksRow").appendChild(planetUnlocksCell);
		})
		
		var environmentRow = tr();
		environmentRow.setAttribute("id", "environmentRow");
		document.getElementById("infotable").appendChild(environmentRow);
		
		var environmentRowFirstCell = td();
		environmentRowFirstCell.appendChild(txt("Environment"));
		document.getElementById("environmentRow").appendChild(environmentRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetEnvironmentCell = td();
			var environmentDiv = div();
			
			environmentDiv.appendChild(div(txt(planet.type.capitalize() + " planet")));
					
			planetEnvironmentCell.appendChild(environmentDiv);
			
			document.getElementById("environmentRow").appendChild(planetEnvironmentCell);
		})
		
		var orbitalDistanceRow = tr();
		orbitalDistanceRow.setAttribute("id", "orbitalDistanceRow");
		document.getElementById("infotable").appendChild(orbitalDistanceRow);
		
		var orbitalDistanceRowFirstCell = td();
		orbitalDistanceRowFirstCell.appendChild(txt("Orbital Distance"));
		document.getElementById("orbitalDistanceRow").appendChild(orbitalDistanceRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetOrbitalDistanceCell = td();
			var orbitalDistanceDiv = div();
			
			orbitalDistanceDiv.appendChild(div(txt(planet.info["orbit"] + " AU")));
					
			planetOrbitalDistanceCell.appendChild(orbitalDistanceDiv);
			
			document.getElementById("orbitalDistanceRow").appendChild(planetOrbitalDistanceCell);
		})
		
		var temperatureRow = tr();
		temperatureRow.setAttribute("id", "temperatureRow");
		document.getElementById("infotable").appendChild(temperatureRow);
		
		var temperatureRowFirstCell = td();
		temperatureRowFirstCell.appendChild(txt("Environment"));
		document.getElementById("temperatureRow").appendChild(temperatureRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetTemperatureCell = td();
			var temperatureDiv = div();
			
			temperatureDiv.appendChild(div(txt(planet.info["temp"] + " °C")));
					
			planetTemperatureCell.appendChild(temperatureDiv);
			
			document.getElementById("temperatureRow").appendChild(planetTemperatureCell);
		})
		
		var baseResourcesRow = tr();
		baseResourcesRow.setAttribute("id", "baseResourcesRow");
		document.getElementById("infotable").appendChild(baseResourcesRow);
		
		var baseResourcesRowFirstCell = td();
		baseResourcesRowFirstCell.appendChild(txt("Base Resources"));
		document.getElementById("baseResourcesRow").appendChild(baseResourcesRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetBaseResourcesCell = td();
			var baseResourcesDiv = div();
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++) {
				var baseResource = planet.baseResources[resourceCostIndex];
				if(baseResource == 0 || (baseResource == 1 && resources[resourceCostIndex].type != "ore"))
					continue;
				baseResourcesDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
				baseResourcesDiv.appendChild(div(txt("x" + beauty(baseResource))));
			}
					
			planetBaseResourcesCell.appendChild(baseResourcesDiv);
			
			document.getElementById("baseResourcesRow").appendChild(planetBaseResourcesCell);
		})
	}
	function createBuildingTable() {
		var buildingTypeSelect = document.getElementById("buildingtypeselect");
		var tableWidth = 150;
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		infoTable.buildings = [];
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
				
				
			for(var requiredResearch in building.researchReq) {
				if(!researches[researchesName[requiredResearch]].pos || requiredResearch == "demographics" || requiredResearch == "energetics")
					return;
			}
				
			var buildingNameCell = th();
			setCellWidth(tableWidth, buildingNameCell);
			var buildingNameTextNode = txt(building.displayName);
			buildingNameCell.appendChild(buildingNameTextNode);
			document.getElementById("headRow").appendChild(buildingNameCell);
			infoTable.buildings.push(building);
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
		
		infoTable.buildings.map(function(building) {
			var buildingEnergyProductionCell = td();
			var energyProductionDiv = div();
			
			if(building.energy != 0) {
				var energyProduction = building.energy;
				energyProduction = beauty(energyProduction);
				energyProductionDiv.appendChild(div(txt(energyProduction + "/s")));
			}
					
			buildingEnergyProductionCell.appendChild(energyProductionDiv);
			
			document.getElementById("energyProductionRow").appendChild(buildingEnergyProductionCell);
		})
		
		var productionRow = tr();
		productionRow.setAttribute("id", "productionRow");
		document.getElementById("infotable").appendChild(productionRow);
		
		var productionRowFirstCell = td();
		productionRowFirstCell.appendChild(txt("Resource Production"));
		document.getElementById("productionRow").appendChild(productionRowFirstCell);
		
		infoTable.buildings.map(function(building) {
			var buildingProductionCell = td();
			var resourceProductionDiv = div();
			
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
		
		infoTable.buildings.map(function(building) {
			var buildingConsumptionCell = td();
			var resourceConsumptionDiv = div();
			
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
		
		infoTable.buildings.map(function(building) {
			var buildingCostCell = td();
			var resourceCostDiv = div();
			
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
		
		infoTable.buildings.map(function(building) {
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
		
		infoTable.buildings.map(function(building) {
			var buildingEnvironmentCell = td();
			var environmentDiv = div();
			
			for(var environmentIndex = 0; environmentIndex<building.environment.length; environmentIndex++)
				environmentDiv.appendChild(div(txt(building.environment[environmentIndex].capitalize() + " planet")));
					
			buildingEnvironmentCell.appendChild(environmentDiv);
			
			document.getElementById("environmentRow").appendChild(buildingEnvironmentCell);
		})
		
		var requirementsRow = tr();
		requirementsRow.setAttribute("id", "requirementsRow");
		document.getElementById("infotable").appendChild(requirementsRow);
		
		var requirementsRowFirstCell = td();
		requirementsRowFirstCell.appendChild(txt("Requirements"));
		document.getElementById("requirementsRow").appendChild(requirementsRowFirstCell);
		
		infoTable.buildings.map(function(building) {
			var buildingRequirementsCell = td();
			var requirementsDiv = div();
			
			for(var requiredResearch in building.researchReq) {
				if(building.researchReq[requiredResearch] == 0)
					continue;
				var research = researches[researchesName[requiredResearch]];
				requirementsDiv.appendChild(div(txt(research.name.capitalize() + ":")));
				requirementsDiv.appendChild(div(txt(building.researchReq[requiredResearch])));
			}
					
			buildingRequirementsCell.appendChild(requirementsDiv);
			
			document.getElementById("requirementsRow").appendChild(buildingRequirementsCell);
		})
	}
	function createResearchTable() {
		var tableWidth = 150;
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		infoTable.researches = [];
		document.getElementById("infotablediv").appendChild(infoTable);

		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		setCellWidth(tableWidth, tableFirstCell);
		document.getElementById("headRow").appendChild(tableFirstCell);
		
		researches.map(function(research) {
			if(!research.pos || research.id == "demographics" || research.id == "energetics")
				return;
			
			for(var requirement in research.req) {
				var requiredResearch = researches[researchesName[requirement]];
				if(!requiredResearch.pos || requiredResearch.id == "demographics" || requiredResearch.id == "energetics")
					return;
			}
				
			var researchNameCell = th();
			setCellWidth(tableWidth, researchNameCell);
			var researchNameTextNode = txt(research.name);
			researchNameCell.appendChild(researchNameTextNode);
			document.getElementById("headRow").appendChild(researchNameCell);
			infoTable.researches.push(research);
		})
		
		infoTable.setAttribute("width", tableWidth);
		
		var descriptionRow = tr();
		descriptionRow.setAttribute("id", "descriptionRow");
		document.getElementById("infotable").appendChild(descriptionRow);
		
		var descriptionRowFirstCell = td();
		descriptionRowFirstCell.appendChild(txt("Description"));
		document.getElementById("descriptionRow").appendChild(descriptionRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchDescriptionCell = td();
			var descriptionDiv = div();
			
			var researchExtraDescription = research.extraDescription();
			var splitString = researchExtraDescription.split(new RegExp("<[b][r]>"));
			researchExtraDescription = splitString.join("\n");
			splitString = researchExtraDescription.split(new RegExp("<[^>]*>"));
			var researchDescription = splitString.join("");
			var stuff = research.extraDescription();
			//var otherstuff = span(stuff);
			researchDescriptionCell.innerHTML = stuff;
			//descriptionDiv.appendChild(div(txt(researchDescription)));
					
			researchDescriptionCell.appendChild(descriptionDiv);
			
			document.getElementById("descriptionRow").appendChild(researchDescriptionCell);
		})
		
		var researchPointsCostRow = tr();
		researchPointsCostRow.setAttribute("id", "researchPointsCostRow");
		document.getElementById("infotable").appendChild(researchPointsCostRow);
		
		var researchPointsCostRowFirstCell = td();
		researchPointsCostRowFirstCell.appendChild(txt("Research Points Cost"));
		document.getElementById("researchPointsCostRow").appendChild(researchPointsCostRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchResearchPointsCostCell = td();
			var researchPointsCostDiv = div();
			
			researchPointsCostDiv.appendChild(div(txt(beauty(research.researchPoint))));
					
			researchResearchPointsCostCell.appendChild(researchPointsCostDiv);
			
			document.getElementById("researchPointsCostRow").appendChild(researchResearchPointsCostCell);
		})
		
		var researchPointsMultRow = tr();
		researchPointsMultRow.setAttribute("id", "researchPointsMultRow");
		document.getElementById("infotable").appendChild(researchPointsMultRow);
		
		var researchPointsMultRowFirstCell = td();
		researchPointsMultRowFirstCell.appendChild(txt("Research Points Multiplier"));
		document.getElementById("researchPointsMultRow").appendChild(researchPointsMultRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchResearchPointsMultCell = td();
			var researchPointsMultDiv = div();
			
			researchPointsMultDiv.appendChild(div(txt(beauty(research.mult))));
					
			researchResearchPointsMultCell.appendChild(researchPointsMultDiv);
			
			document.getElementById("researchPointsMultRow").appendChild(researchResearchPointsMultCell);
		})
		
		var techPointsCostRow = tr();
		techPointsCostRow.setAttribute("id", "techPointsCostRow");
		document.getElementById("infotable").appendChild(techPointsCostRow);
		
		var techPointsCostRowFirstCell = td();
		techPointsCostRowFirstCell.appendChild(txt("Tech Points Cost"));
		document.getElementById("techPointsCostRow").appendChild(techPointsCostRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchTechPointsCostCell = td();
			var techPointsCostDiv = div();
			
			techPointsCostDiv.appendChild(div(txt(beauty(research.techPoint))));
					
			researchTechPointsCostCell.appendChild(techPointsCostDiv);
			
			document.getElementById("techPointsCostRow").appendChild(researchTechPointsCostCell);
		})
		
		var techPointsMultRow = tr();
		techPointsMultRow.setAttribute("id", "techPointsMultRow");
		document.getElementById("infotable").appendChild(techPointsMultRow);
		
		var techPointsMultRowFirstCell = td();
		techPointsMultRowFirstCell.appendChild(txt("Tech Points Multiplier"));
		document.getElementById("techPointsMultRow").appendChild(techPointsMultRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchTechPointsMultCell = td();
			var techPointsMultDiv = div();
			
			techPointsMultDiv.appendChild(div(txt(beauty(research.multBonus))));
					
			researchTechPointsMultCell.appendChild(techPointsMultDiv);
			
			document.getElementById("techPointsMultRow").appendChild(researchTechPointsMultCell);
		})
		
		var maxLevelRow = tr();
		maxLevelRow.setAttribute("id", "maxLevelRow");
		document.getElementById("infotable").appendChild(maxLevelRow);
		
		var maxLevelRowFirstCell = td();
		maxLevelRowFirstCell.appendChild(txt("Max Level"));
		document.getElementById("maxLevelRow").appendChild(maxLevelRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchMaxLevelCell = td();
			var maxLevelDiv = div();
			
			maxLevelDiv.appendChild(div(txt(research.max)));
					
			researchMaxLevelCell.appendChild(maxLevelDiv);
			
			document.getElementById("maxLevelRow").appendChild(researchMaxLevelCell);
		})
		
		var requirementsRow = tr();
		requirementsRow.setAttribute("id", "requirementsRow");
		document.getElementById("infotable").appendChild(requirementsRow);
		
		var requirementsRowFirstCell = td();
		requirementsRowFirstCell.appendChild(txt("Requirements"));
		document.getElementById("requirementsRow").appendChild(requirementsRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchRequirementsCell = td();
			var requirementsDiv = div();
			
			for(var requirement in research.req) {
				requirementsDiv.appendChild(div(txt(researches[researchesName[requirement]].name.capitalize() + ":")));
				requirementsDiv.appendChild(div(txt(research.req[requirement])));
			}
					
			researchRequirementsCell.appendChild(requirementsDiv);
			
			document.getElementById("requirementsRow").appendChild(researchRequirementsCell);
		})
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
		["planets", "buildings", "researches", "ships"/*, "artifacts", "quests"*/].map(function(infoSelectionList) {
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
	
	createinfoSelectionList();

	window.onpopstate = function() {
		update();
	};
	
	var update = document.getElementById("infotool").onchange = function() {
		var infoSelect = document.getElementById("infoselect");
		var infoSelected = infoSelect.value;
		if(infoSelected == "planets") {
			if(checkbuildingtypeselect(infoSelect))
				removebuildingtypeselect();
			deleteTable();
			createPlanetTable();
		}
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
		infoSelect.lastSelected = infoSelect.value;
	}
	update();
});