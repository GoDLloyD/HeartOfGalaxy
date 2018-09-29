document.addEventListener("DOMContentLoaded", function() {
	'use strict';
	
	function setCellWidth(tableWidth, cell) {
		var cellWidth = 150;
		tableWidth += cellWidth;
		cell.setAttribute("width", cellWidth);
	}
	function dmgredPercent(armor) {
		return (1 - 1 / (1 + Math.log(1 + armor / 1E4) / Math.log(2))) * 100;
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
			if(!planet.x || !planet.y || planet.info["orbit"] == 0)
				return;
			for(var pushedPlanetIndex = 0; pushedPlanetIndex < infoTable.planets.length; pushedPlanetIndex++) {
				if(infoTable.planets[pushedPlanetIndex].name == planet.name) {
					infoTable.planets[pushedPlanetIndex] = planet;
					return;
				}
			}
			infoTable.planets.push(planet);
		});
		
		infoTable.planets.sort(function(planetA, planetB) {
			var planetAStrongestFleet;
			var planetBStrongestFleet;
			
			for(var planetIndex in planetA.fleets) {
				var fleet = planetA.fleets[planetIndex];
				if(planetAStrongestFleet == null)
					planetAStrongestFleet = fleet;
				if(fleetStats(planetAStrongestFleet).Value < fleetStats(fleet).Value)
					planetAStrongestFleet = fleet;
			}
			for(var planetIndex in planetB.fleets) {
				var fleet = planetB.fleets[planetIndex];
				if(planetBStrongestFleet == null)
					planetBStrongestFleet = fleet;
				if(fleetStats(planetBStrongestFleet).Value < fleetStats(fleet).Value)
					planetBStrongestFleet = fleet;
			}
			
			return fleetStats(planetAStrongestFleet).Value - fleetStats(planetBStrongestFleet).Value; 
		});
		
		infoTable.planets.map(function(planet) {
			var planetNameCell = th();
			setCellWidth(tableWidth, planetNameCell);
			var planetNameTextNode = label(txt(planet.name));
			planetNameTextNode.title = "Well, that's a Planet, what did you expect?";
			planetNameCell.appendChild(planetNameTextNode);
			document.getElementById("headRow").appendChild(planetNameCell);
		});
		
		infoTable.setAttribute("width", tableWidth);
		
		var influenceRow = tr();
		influenceRow.setAttribute("id", "influenceRow");
		document.getElementById("infotable").appendChild(influenceRow);
		
		var influenceRowFirstCell = td();
		var influenceLabel = label(txt("Influence"));
		influenceLabel.title = "The amount of Influence you gain from conquering this Planet";
		influenceRowFirstCell.appendChild(influenceLabel);
		document.getElementById("influenceRow").appendChild(influenceRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetInfluenceCell = td();
			var influenceDiv = div();
			
			influenceDiv.appendChild(div(txt(planet.influence)));
					
			planetInfluenceCell.appendChild(influenceDiv);
			
			document.getElementById("influenceRow").appendChild(planetInfluenceCell);
		});
		
		var unlocksRow = tr();
		unlocksRow.setAttribute("id", "unlocksRow");
		document.getElementById("infotable").appendChild(unlocksRow);
		
		var unlocksRowFirstCell = td();
		var unlockLabel = label(txt("Unlocks"));
		unlockLabel.title = "Unlocks stuff";
		unlocksRowFirstCell.appendChild(unlockLabel);
		document.getElementById("unlocksRow").appendChild(unlocksRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetUnlocksCell = td();
			var unlocksDiv = div();
			
			if(planet.unlock)
				unlocksDiv.appendChild(div(txt(researches[researchesName[planet.unlock]].name.capitalize())));
						
			planetUnlocksCell.appendChild(unlocksDiv);
			
			document.getElementById("unlocksRow").appendChild(planetUnlocksCell);
		});
		
		var environmentRow = tr();
		environmentRow.setAttribute("id", "environmentRow");
		document.getElementById("infotable").appendChild(environmentRow);
		
		var environmentRowFirstCell = td();
		var environmentLabel = label(txt("Environment"));
		environmentLabel.title = "The Environment of the Planet, it decides which Buildings can or cannot be built on a Planet";
		environmentRowFirstCell.appendChild(environmentLabel);
		document.getElementById("environmentRow").appendChild(environmentRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetEnvironmentCell = td();
			var environmentDiv = div();
			
			environmentDiv.appendChild(div(txt(planet.type.capitalize() + " planet")));
					
			planetEnvironmentCell.appendChild(environmentDiv);
			
			document.getElementById("environmentRow").appendChild(planetEnvironmentCell);
		});
		
		var orbitalDistanceRow = tr();
		orbitalDistanceRow.setAttribute("id", "orbitalDistanceRow");
		document.getElementById("infotable").appendChild(orbitalDistanceRow);
		
		var orbitalDistanceRowFirstCell = td();
		var orbitalDistanceLabel = label(txt("Orbital Distance"));
		orbitalDistanceLabel.title = "The Distance the Planet orbits around its sun, it decides how much Energy is generated by \"" + buildings[buildingsName["solar"]].displayName + "\"s\nThe amount of Energy generated is Base Production / (Orbital Distance * Orbital Distance)";
		orbitalDistanceRowFirstCell.appendChild(orbitalDistanceLabel);
		document.getElementById("orbitalDistanceRow").appendChild(orbitalDistanceRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetOrbitalDistanceCell = td();
			var orbitalDistanceDiv = div();
			
			orbitalDistanceDiv.appendChild(div(txt(planet.info["orbit"] + " AU")));
					
			planetOrbitalDistanceCell.appendChild(orbitalDistanceDiv);
			
			document.getElementById("orbitalDistanceRow").appendChild(planetOrbitalDistanceCell);
		});
		
		var temperatureRow = tr();
		temperatureRow.setAttribute("id", "temperatureRow");
		document.getElementById("infotable").appendChild(temperatureRow);
		
		var temperatureRowFirstCell = td();
		var temperatureLabel = label(txt("Temperature"));
		temperatureLabel.title = "The Temperature of the Planet, it decides the amount of Research Points generated by \"" + buildings[buildingsName["cryolab"]].displayName + "\"s\nThe amount of Research Points generated is Base Production * Temperature * -5";
		temperatureRowFirstCell.appendChild(temperatureLabel);
		document.getElementById("temperatureRow").appendChild(temperatureRowFirstCell);
		
		infoTable.planets.map(function(planet) {
			var planetTemperatureCell = td();
			var temperatureDiv = div();
			
			temperatureDiv.appendChild(div(txt(planet.info["temp"] + " °C")));
					
			planetTemperatureCell.appendChild(temperatureDiv);
			
			document.getElementById("temperatureRow").appendChild(planetTemperatureCell);
		});
		
		var baseResourcesRow = tr();
		baseResourcesRow.setAttribute("id", "baseResourcesRow");
		document.getElementById("infotable").appendChild(baseResourcesRow);
		
		var baseResourcesRowFirstCell = td();
		var baseResourcesLabel = label(txt("Base Resources"));
		baseResourcesLabel.title = "The Planets Base Multipliers for Resource Production";
		baseResourcesRowFirstCell.appendChild(baseResourcesLabel);
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
		});
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
			var buildingNameTextNode = label(txt(building.displayName));
			buildingNameTextNode.title = "Well, that's a Building, what did you expect?";
			buildingNameCell.appendChild(buildingNameTextNode);
			document.getElementById("headRow").appendChild(buildingNameCell);
			infoTable.buildings.push(building);
		});
		
		infoTable.setAttribute("width", tableWidth);
		
		var energyProductionRow = tr();
		energyProductionRow.setAttribute("id", "energyProductionRow");
		document.getElementById("infotable").appendChild(energyProductionRow);
		
		var energyProductionRowFirstCell = td();
		var energyProductionLabelString = "Energy Consumption";
		var energyProductionLabelTitleString = "The amount of Energy Consumed by a Building";
		if(buildingTypeSelect.value == "energy") {
			energyProductionLabelString = "Energy Production";
			energyProductionLabelTitleString = "The amount of Energy Produced by a Building";
		}
		
		var energyProductionLabel = label(txt(energyProductionLabelString));
		energyProductionLabel.title = energyProductionLabelTitleString;
		energyProductionRowFirstCell.appendChild(energyProductionLabel);
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
		});
		
		var productionRow = tr();
		productionRow.setAttribute("id", "productionRow");
		document.getElementById("infotable").appendChild(productionRow);
		
		var productionRowFirstCell = td();
		if(buildingTypeSelect.value != "research") {
			var productionLabel = label(txt("Resource Production"));
		} else {
			var productionLabel = label(txt("Research Production"));
		}
		productionLabel.title = "The amounts and types of Resources produced per second by a Building";
		productionRowFirstCell.appendChild(productionLabel);
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
				if(building.name == "cryolab")
					resourceProductionDiv.appendChild(div(txt("Base*Temperature*(-5)")));
				if(building.name == "lavaresearch")
					resourceProductionDiv.appendChild(div(txt("Base*Temperature")));
				if(building.name == "ammonia_airship")
					resourceProductionDiv.appendChild(div(txt("Base*Radius")));
			}
					
			buildingProductionCell.appendChild(resourceProductionDiv);
			
			document.getElementById("productionRow").appendChild(buildingProductionCell);
		});
		
		var consumptionRow = tr();
		consumptionRow.setAttribute("id", "consumptionRow");
		document.getElementById("infotable").appendChild(consumptionRow);
		
		var consumptionRowFirstCell = td();
		var consumptionLabel = label(txt("Resource Consumption"));
		consumptionLabel.title = "The amounts and types of Resources consumed per second by a Building";
		consumptionRowFirstCell.appendChild(consumptionLabel);
		document.getElementById("consumptionRow").appendChild(consumptionRowFirstCell);
		
		infoTable.buildings.map(function(building) {
			var buildingConsumptionCell = td();
			var resourceConsumptionDiv = div();
			
			for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++)
				if(building.resourcesProd[resourceCostIndex]<0) {
					var resourceConsumption = building.resourcesProd[resourceCostIndex];
					resourceConsumption = beauty(resourceConsumption);
					resourceConsumptionDiv.appendChild(div(txt(resources[resourceCostIndex].name.capitalize() + ":")));
					resourceConsumptionDiv.appendChild(div(txt(resourceConsumption + "/s")));
				}
					
			buildingConsumptionCell.appendChild(resourceConsumptionDiv);
			
			document.getElementById("consumptionRow").appendChild(buildingConsumptionCell);
		});
		
		var costRow = tr();
		costRow.setAttribute("id", "costRow");
		document.getElementById("infotable").appendChild(costRow);
		
		var costRowFirstCell = td();
		var costLabel = label(txt("Resource Cost"));
		costLabel.title = "The amounts and types of Resources required to build a Building";
		costRowFirstCell.appendChild(costLabel);
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
		});
		
		var costMultiplierRow = tr();
		costMultiplierRow.setAttribute("id", "costMultiplierRow");
		document.getElementById("infotable").appendChild(costMultiplierRow);
		
		var costMultiplierRowFirstCell = td();
		var costMultiplierLabel = label(txt("Resource Multiplier"));
		costMultiplierLabel.title = "The Multipliers at which the Cost of a Building is increased per Level";
		costMultiplierRowFirstCell.appendChild(costMultiplierLabel);
		document.getElementById("costMultiplierRow").appendChild(costMultiplierRowFirstCell);
		
		infoTable.buildings.map(function(building) {
			var buildingcostMultiplierCell = td();
			var resourcecostMultiplierDiv = div();
			
			for(var resourceCostMultiplierIndex = 0; resourceCostMultiplierIndex<resNum; resourceCostMultiplierIndex++)
				if(building.resourcesCost[resourceCostMultiplierIndex]>0) {
					resourcecostMultiplierDiv.appendChild(div(txt(resources[resourceCostMultiplierIndex].name.capitalize() + ":")));
					resourcecostMultiplierDiv.appendChild(div(txt(building.resourcesMult[resourceCostMultiplierIndex])));
				}
					
			buildingcostMultiplierCell.appendChild(resourcecostMultiplierDiv);
			
			document.getElementById("costMultiplierRow").appendChild(buildingcostMultiplierCell);
		});
		
		var environmentRow = tr();
		environmentRow.setAttribute("id", "environmentRow");
		document.getElementById("infotable").appendChild(environmentRow);
		
		var environmentRowFirstCell = td();
		var environmentLabel = label(txt("Environment"));
		environmentLabel.title = "The Environments of a Building, those decide on which types of Planet a Buildings can be built";
		environmentRowFirstCell.appendChild(environmentLabel);
		document.getElementById("environmentRow").appendChild(environmentRowFirstCell);
		
		infoTable.buildings.map(function(building) {
			var buildingEnvironmentCell = td();
			var environmentDiv = div();
			
			for(var environmentIndex = 0; environmentIndex<building.environment.length; environmentIndex++)
				environmentDiv.appendChild(div(txt(building.environment[environmentIndex].capitalize() + " planet")));
					
			buildingEnvironmentCell.appendChild(environmentDiv);
			
			document.getElementById("environmentRow").appendChild(buildingEnvironmentCell);
		});
		
		var requirementsRow = tr();
		requirementsRow.setAttribute("id", "requirementsRow");
		document.getElementById("infotable").appendChild(requirementsRow);
		
		var requirementsRowFirstCell = td();
		var requirementsLabel = label(txt("Requirements"));
		requirementsLabel.title = "The Requirements you must meet in order to be able to build a Building";
		requirementsRowFirstCell.appendChild(requirementsLabel);
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
		});
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
			var researchNameTextNode = label(txt(research.name));
			researchNameTextNode.title = "Well, that's a Research, what did you expect?";
			researchNameCell.appendChild(researchNameTextNode);
			document.getElementById("headRow").appendChild(researchNameCell);
			infoTable.researches.push(research);
		});
		
		infoTable.setAttribute("width", tableWidth);
		
		var descriptionRow = tr();
		descriptionRow.setAttribute("id", "descriptionRow");
		document.getElementById("infotable").appendChild(descriptionRow);
		
		var descriptionRowFirstCell = td();
		var descriptionLabel = label(txt("Description"));
		descriptionLabel.title = "The ingame Description of a Research, which contains informations about its effects";
		descriptionRowFirstCell.appendChild(descriptionLabel);
		document.getElementById("descriptionRow").appendChild(descriptionRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchDescriptionCell = td();
			var descriptionDiv = div();
			
			researchDescriptionCell.innerHTML = research.extraDescription();
					
			researchDescriptionCell.appendChild(descriptionDiv);
			
			document.getElementById("descriptionRow").appendChild(researchDescriptionCell);
		});
		
		var bonusRow = tr();
		bonusRow.setAttribute("id", "bonusRow");
		document.getElementById("infotable").appendChild(bonusRow);
		
		var bonusRowFirstCell = td();
		var bonusLabel = label(txt("Bonus"));
		bonusLabel.title = "The ingame Bonus of a Research, each Bonus is unlocked at a certain Level of a Research";
		bonusRowFirstCell.appendChild(bonusLabel);
		document.getElementById("bonusRow").appendChild(bonusRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchBonusCell = td();
			var bonusDiv = div();
			
			research.level = research.max;
			researchBonusCell.innerHTML = research.description();
			if(research.id == "astronomy") {
				var astronomyBonus = [];
				astronomyBonus = researchBonusCell.innerHTML.split(research.level + 1);
				researchBonusCell.innerHTML = astronomyBonus.join("+1");
			}
					
			researchBonusCell.appendChild(bonusDiv);
			
			document.getElementById("bonusRow").appendChild(researchBonusCell);
		});
		
		var researchPointsCostRow = tr();
		researchPointsCostRow.setAttribute("id", "researchPointsCostRow");
		document.getElementById("infotable").appendChild(researchPointsCostRow);
		
		var researchPointsCostRowFirstCell = td();
		var researchPointsCostLabel = label(txt("Research Points Cost"));
		researchPointsCostLabel.title = "The amount of Research Points required to unlock a Research";
		researchPointsCostRowFirstCell.appendChild(researchPointsCostLabel);
		document.getElementById("researchPointsCostRow").appendChild(researchPointsCostRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchResearchPointsCostCell = td();
			var researchPointsCostDiv = div();
			
			researchPointsCostDiv.appendChild(div(txt(beauty(research.researchPoint))));
					
			researchResearchPointsCostCell.appendChild(researchPointsCostDiv);
			
			document.getElementById("researchPointsCostRow").appendChild(researchResearchPointsCostCell);
		});
		
		var researchPointsMultRow = tr();
		researchPointsMultRow.setAttribute("id", "researchPointsMultRow");
		document.getElementById("infotable").appendChild(researchPointsMultRow);
		
		var researchPointsMultRowFirstCell = td();
		var researchPointsMultLabel = label(txt("Research Points Multiplier"));
		researchPointsMultLabel.title = "The Multiplier at which the Research Points Cost of a Research is increased per Level";
		researchPointsMultRowFirstCell.appendChild(researchPointsMultLabel);
		document.getElementById("researchPointsMultRow").appendChild(researchPointsMultRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchResearchPointsMultCell = td();
			var researchPointsMultDiv = div();
			
			researchPointsMultDiv.appendChild(div(txt(beauty(research.mult))));
					
			researchResearchPointsMultCell.appendChild(researchPointsMultDiv);
			
			document.getElementById("researchPointsMultRow").appendChild(researchResearchPointsMultCell);
		});
		
		var techPointsCostRow = tr();
		techPointsCostRow.setAttribute("id", "techPointsCostRow");
		document.getElementById("infotable").appendChild(techPointsCostRow);
		
		var techPointsCostRowFirstCell = td();
		var techPointsCostLabel = label(txt("Tech Points Cost"));
		techPointsCostLabel.title = "The amount of Tech Points required to unlock a Research";
		techPointsCostRowFirstCell.appendChild(techPointsCostLabel);
		document.getElementById("techPointsCostRow").appendChild(techPointsCostRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchTechPointsCostCell = td();
			var techPointsCostDiv = div();
			
			techPointsCostDiv.appendChild(div(txt(beauty(research.techPoint))));
					
			researchTechPointsCostCell.appendChild(techPointsCostDiv);
			
			document.getElementById("techPointsCostRow").appendChild(researchTechPointsCostCell);
		});
		
		var techPointsMultRow = tr();
		techPointsMultRow.setAttribute("id", "techPointsMultRow");
		document.getElementById("infotable").appendChild(techPointsMultRow);
		
		var techPointsMultRowFirstCell = td();
		var techPointsMultLabel = label(txt("Tech Points Multiplier"));
		techPointsMultLabel.title = "The Multiplier at which the Tech Points Cost of a Research is increased per Level";
		techPointsMultRowFirstCell.appendChild(techPointsMultLabel);
		document.getElementById("techPointsMultRow").appendChild(techPointsMultRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchTechPointsMultCell = td();
			var techPointsMultDiv = div();
			
			techPointsMultDiv.appendChild(div(txt(beauty(research.multBonus))));
					
			researchTechPointsMultCell.appendChild(techPointsMultDiv);
			
			document.getElementById("techPointsMultRow").appendChild(researchTechPointsMultCell);
		});
		
		var maxLevelRow = tr();
		maxLevelRow.setAttribute("id", "maxLevelRow");
		document.getElementById("infotable").appendChild(maxLevelRow);
		
		var maxLevelRowFirstCell = td();
		var maxLevelLabel = label(txt("Max Level"));
		maxLevelLabel.title = "The maximum level of a Research";
		maxLevelRowFirstCell.appendChild(maxLevelLabel);
		document.getElementById("maxLevelRow").appendChild(maxLevelRowFirstCell);
		
		infoTable.researches.map(function(research) {
			var researchMaxLevelCell = td();
			var maxLevelDiv = div();
			
			maxLevelDiv.appendChild(div(txt(research.max)));
					
			researchMaxLevelCell.appendChild(maxLevelDiv);
			
			document.getElementById("maxLevelRow").appendChild(researchMaxLevelCell);
		});
		
		var requirementsRow = tr();
		requirementsRow.setAttribute("id", "requirementsRow");
		document.getElementById("infotable").appendChild(requirementsRow);
		
		var requirementsRowFirstCell = td();
		var requirementsLabel = label(txt("Requirements"));
		requirementsLabel.title = "The Requirements you must meet in order to be able to research a Research";
		requirementsRowFirstCell.appendChild(requirementsLabel);
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
		});
	}
	function createShipTable() {
		var tableWidth = 150;
		
		var infoTable = document.createElement("TABLE");
		infoTable.setAttribute("id", "infotable");
		infoTable.ships = [];
		document.getElementById("infotablediv").appendChild(infoTable);

		var headRow = tr();
		headRow.setAttribute("id", "headRow");
		document.getElementById("infotable").appendChild(headRow);

		var tableFirstCell = th();
		setCellWidth(tableWidth, tableFirstCell);
		document.getElementById("headRow").appendChild(tableFirstCell);
		
		game.ships.map(function(ship) {
			var shipNameCell = th();
			setCellWidth(tableWidth, shipNameCell);
			if(ship.special["desc"]) {
				shipNameCell.setAttribute("Width", 320);
			}
			var shipNameTextNode = label(txt(ship.name));
			shipNameTextNode.title = "Well, that's a Ship, what did you expect?";
			shipNameCell.appendChild(shipNameTextNode);
			document.getElementById("headRow").appendChild(shipNameCell);
			infoTable.ships.push(ship);
		});
		
		infoTable.setAttribute("width", tableWidth);
		
		var typeRow = tr();
		typeRow.setAttribute("id", "typeRow");
		document.getElementById("infotable").appendChild(typeRow);
		
		var typeRowFirstCell = td();
		var typeLabel = label(txt("Type"));
		typeLabel.title = "The Type of a Ship";
		typeRowFirstCell.appendChild(typeLabel);
		document.getElementById("typeRow").appendChild(typeRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipTypeCell = td();
			var typeDiv = div();
			
			typeDiv.appendChild(div(txt(ship.type)));
					
			shipTypeCell.appendChild(typeDiv);
			
			document.getElementById("typeRow").appendChild(shipTypeCell);
		});
		
		var hpRow = tr();
		hpRow.setAttribute("id", "hpRow");
		document.getElementById("infotable").appendChild(hpRow);
		
		var hpRowFirstCell = td();
		var hpLabel = label(txt("Hp"));
		hpLabel.title = "HPs are the amount of damage the\nship can sustain before\nbeing destroyed";
		hpRowFirstCell.appendChild(hpLabel);
		document.getElementById("hpRow").appendChild(hpRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipHpCell = td();
			var hpDiv = div();
			
			hpDiv.appendChild(div(txt(beauty(ship.hp))));
					
			shipHpCell.appendChild(hpDiv);
			
			document.getElementById("hpRow").appendChild(shipHpCell);
		});
		
		var powerRow = tr();
		powerRow.setAttribute("id", "powerRow");
		document.getElementById("infotable").appendChild(powerRow);
		
		var powerRowFirstCell = td();
		var powerLabel = label(txt("Power"));
		powerLabel.title = "Power is the amount of RAW damage\nthe ship can do. It can\nbe boosted by equipping Ammunitions";
		powerRowFirstCell.appendChild(powerLabel);
		document.getElementById("powerRow").appendChild(powerRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipPowerCell = td();
			var powerDiv = div();
			
			powerDiv.appendChild(div(txt(beauty(ship.power))));
					
			shipPowerCell.appendChild(powerDiv);
			
			document.getElementById("powerRow").appendChild(shipPowerCell);
		});
		
		var weaponRow = tr();
		weaponRow.setAttribute("id", "weaponRow");
		document.getElementById("infotable").appendChild(weaponRow);
		
		var weaponRowFirstCell = td();
		var weaponLabel = label(txt("Weapon"));
		weaponLabel.title = "The Weapon type of a Ship\nBallistic Weapon Ships gain a 10% Power Bonus with the \"" + artifacts[artifactsName["thoroid"]].name + "\"-Artifact";
		weaponRowFirstCell.appendChild(weaponLabel);
		document.getElementById("weaponRow").appendChild(weaponRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipWeaponCell = td();
			var weaponDiv = div();
			
			
			weaponDiv.appendChild(div(txt(ship.weapon)));
					
			shipWeaponCell.appendChild(weaponDiv);
			
			document.getElementById("weaponRow").appendChild(shipWeaponCell);
		});
		
		var piercingPowerRow = tr();
		piercingPowerRow.setAttribute("id", "piercingPowerRow");
		document.getElementById("infotable").appendChild(piercingPowerRow);
		
		var piercingPowerRowFirstCell = td();
		var piercingPowerLabel = label(txt("Piercing Power"));
		piercingPowerLabel.title = "Piercing power is the amount of\ndamage reduction ignored while\ndamaging an enemy ship";
		piercingPowerRowFirstCell.appendChild(piercingPowerLabel);
		document.getElementById("piercingPowerRow").appendChild(piercingPowerRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipPiercingPowerCell = td();
			var piercingPowerDiv = div();
			
			if(ship.piercing > 0)
				piercingPowerDiv.appendChild(div(txt(ship.piercing + "%")));
					
			shipPiercingPowerCell.appendChild(piercingPowerDiv);
			
			document.getElementById("piercingPowerRow").appendChild(shipPiercingPowerCell);
		});
		
		var shieldsRow = tr();
		shieldsRow.setAttribute("id", "shieldsRow");
		document.getElementById("infotable").appendChild(shieldsRow);
		
		var shieldsRowFirstCell = td();
		var shieldsLabel = label(txt("Shields"));
		shieldsLabel.title = "Shields power is the amount of\nincoming damage that gets\ntotally blocked";
		shieldsRowFirstCell.appendChild(shieldsLabel);
		document.getElementById("shieldsRow").appendChild(shieldsRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipShieldsCell = td();
			var shieldsDiv = div();
			
			if(ship.shield > 0)
				shieldsDiv.appendChild(div(txt(beauty(ship.shield))));
					
			shipShieldsCell.appendChild(shieldsDiv);
			
			document.getElementById("shieldsRow").appendChild(shipShieldsCell);
		});
		
		var armorRow = tr();
		armorRow.setAttribute("id", "armorRow");
		document.getElementById("infotable").appendChild(armorRow);
		
		var armorRowFirstCell = td();
		var armorLabel = label(txt("Armor"));
		armorLabel.title = "Armor reduces incoming damage.\nIt can be boosted by equipping Armor";
		armorRowFirstCell.appendChild(armorLabel);
		document.getElementById("armorRow").appendChild(armorRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipArmorCell = td();
			var armorDiv = div();
			
			armorDiv.appendChild(div(txt(beauty(ship.armor))));
					
			shipArmorCell.appendChild(armorDiv);
			
			document.getElementById("armorRow").appendChild(shipArmorCell);
		});
		
		var damageReductionRow = tr();
		damageReductionRow.setAttribute("id", "damageReductionRow");
		document.getElementById("infotable").appendChild(damageReductionRow);
		
		var damageReductionRowFirstCell = td();
		var damageReductionLabel = label(txt("Damage Reduction"));
		damageReductionLabel.title = "Damage reduction is the percentage\nof enemy damage absorbed by the\narmor.";
		damageReductionRowFirstCell.appendChild(damageReductionLabel);
		document.getElementById("damageReductionRow").appendChild(damageReductionRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipDamageReductionCell = td();
			var damageReductionDiv = div();
			
			damageReductionDiv.appendChild(div(txt(beauty(dmgredPercent(ship.armor)) + "%")));
					
			shipDamageReductionCell.appendChild(damageReductionDiv);
			
			document.getElementById("damageReductionRow").appendChild(shipDamageReductionCell);
		});
		
		var speedRow = tr();
		speedRow.setAttribute("id", "speedRow");
		document.getElementById("infotable").appendChild(speedRow);
		
		var speedRowFirstCell = td();
		var speedLabel = label(txt("Speed"));
		speedLabel.title = "Speed affects the travelling time of\na ship. It also increases power\nif it is higher than enemy speed,\nor decreases power if it is lower\nthan the enemy speed.\nIt can be boosted by equipping Engines";
		speedRowFirstCell.appendChild(speedLabel);
		document.getElementById("speedRow").appendChild(speedRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipSpeedCell = td();
			var speedDiv = div();
			
			speedDiv.appendChild(div(txt(ship.speed)));
					
			shipSpeedCell.appendChild(speedDiv);
			
			document.getElementById("speedRow").appendChild(shipSpeedCell);
		});
		
		var weightRow = tr();
		weightRow.setAttribute("id", "weightRow");
		document.getElementById("infotable").appendChild(weightRow);
		
		var weightRowFirstCell = td();
		var weightLabel = label(txt("Weight"));
		weightLabel.title = "Weight (does includes cargo) increases the Cost of sending your fleet through the \"" + buildings[buildingsName["space_machine"]].displayName + "\" or the \"" + buildings[buildingsName["space_beta"]].displayName + "\"";
		weightRowFirstCell.appendChild(weightLabel);
		document.getElementById("weightRow").appendChild(weightRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipWeightCell = td();
			var weightDiv = div();
			
			weightDiv.appendChild(div(txt(beauty(ship.weight))));
					
			shipWeightCell.appendChild(weightDiv);
			
			document.getElementById("weightRow").appendChild(shipWeightCell);
		});
		
		var combatWeightRow = tr();
		combatWeightRow.setAttribute("id", "combatWeightRow");
		document.getElementById("infotable").appendChild(combatWeightRow);
		
		var combatWeightRowFirstCell = td();
		var combatWeightLabel = label(txt("Combat Weight"));
		combatWeightLabel.title = "Combat Weight (does not include cargo) affects the power's\nbonus/malus given by speed. Also,\nenemies focus damage on higher Combat Weight\ntargets";
		combatWeightRowFirstCell.appendChild(combatWeightLabel);
		document.getElementById("combatWeightRow").appendChild(combatWeightRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipCombatWeightCell = td();
			var combatWeightDiv = div();
			
			combatWeightDiv.appendChild(div(txt(beauty(ship.combatWeight))));
					
			shipCombatWeightCell.appendChild(combatWeightDiv);
			
			document.getElementById("combatWeightRow").appendChild(shipCombatWeightCell);
		});
		
		var storageRow = tr();
		storageRow.setAttribute("id", "storageRow");
		document.getElementById("infotable").appendChild(storageRow);
		
		var storageRowFirstCell = td();
		var storageLabel = label(txt("Storage"));
		storageLabel.title = "Storage is the amount of\nresources that a ship can carry";
		storageRowFirstCell.appendChild(storageLabel);
		document.getElementById("storageRow").appendChild(storageRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipStorageCell = td();
			var storageDiv = div();
			
			storageDiv.appendChild(div(txt(beauty(ship.maxStorage))));
					
			shipStorageCell.appendChild(storageDiv);
			
			document.getElementById("storageRow").appendChild(shipStorageCell);
		});
		
		var specialEffectRow = tr();
		specialEffectRow.setAttribute("id", "specialEffectRow");
		document.getElementById("infotable").appendChild(specialEffectRow);
		
		var specialEffectRowFirstCell = td();
		var specialEffectLabel = label(txt("Special Effect"));
		specialEffectLabel.title = "The Special Effect of a Ship";
		specialEffectRowFirstCell.appendChild(specialEffectLabel);
		document.getElementById("specialEffectRow").appendChild(specialEffectRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipSpecialEffectCell = td();
			var specialEffectDiv = div();
			
			if(ship.special["desc"]) {
				shipSpecialEffectCell.innerHTML = ship.special["desc"];
			}
					
			shipSpecialEffectCell.appendChild(specialEffectDiv);
			
			document.getElementById("specialEffectRow").appendChild(shipSpecialEffectCell);
		});
		
		var costRow = tr();
		costRow.setAttribute("id", "costRow");
		document.getElementById("infotable").appendChild(costRow);
		
		var costRowFirstCell = td();
		var costLabel = label(txt("Cost"));
		costLabel.title = "The amounts and types of Resources required to build a Ship";
		costRowFirstCell.appendChild(costLabel);
		document.getElementById("costRow").appendChild(costRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipCostCell = td();
			var costDiv = div();
			
			for(var requiredResourceIndex in ship.cost) {
				if(ship.cost[requiredResourceIndex]>0) {
					costDiv.appendChild(div(txt(resources[requiredResourceIndex].name.capitalize() + ":")));
					costDiv.appendChild(div(txt(beauty(ship.cost[requiredResourceIndex]))));
				}
			}
					
			shipCostCell.appendChild(costDiv);
			
			document.getElementById("costRow").appendChild(shipCostCell);
		});
		
		var requirementsRow = tr();
		requirementsRow.setAttribute("id", "requirementsRow");
		document.getElementById("infotable").appendChild(requirementsRow);
		
		var requirementsRowFirstCell = td();
		var requirementsLabel = label(txt("Requirements"));
		requirementsLabel.title = "The Requirements you must meet in order to be able to build a Ship";
		requirementsRowFirstCell.appendChild(requirementsLabel);
		document.getElementById("requirementsRow").appendChild(requirementsRowFirstCell);
		
		infoTable.ships.map(function(ship) {
			var shipRequirementsCell = td();
			var requirementsDiv = div();
			
			requirementsDiv.appendChild(div(txt(buildings[buildingsName["shipyard"]].displayName + ":")));
			requirementsDiv.appendChild(div(txt(ship.req)));
			
			for(var requirement in ship.resReq) {
				requirementsDiv.appendChild(div(txt(researches[researchesName[requirement]].name.capitalize() + ":")));
				requirementsDiv.appendChild(div(txt(ship.resReq[requirement])));
			}
					
			shipRequirementsCell.appendChild(requirementsDiv);
			
			document.getElementById("requirementsRow").appendChild(shipRequirementsCell);
		});
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
			deleteChildElements(document.getElementById("infotablediv"));
			createPlanetTable();
		}
		if(infoSelected == "buildings") {
			if(infoSelect.lastSelected != infoSelect.value)
				createbuildingtypeselect();
			deleteChildElements(document.getElementById("infotablediv"));
			createBuildingTable();
			
		}
		if(infoSelected == "researches") {
			if(checkbuildingtypeselect(infoSelect))
				removebuildingtypeselect();
			deleteChildElements(document.getElementById("infotablediv"));
			createResearchTable();
			
		}
		if(infoSelected == "ships") {
			if(checkbuildingtypeselect(infoSelect))
				removebuildingtypeselect();
			deleteChildElements(document.getElementById("infotablediv"));
			createShipTable();
			
		}
		infoSelect.lastSelected = infoSelect.value;
	}
	update();
});