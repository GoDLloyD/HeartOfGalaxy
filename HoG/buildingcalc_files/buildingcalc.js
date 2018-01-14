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
	
	function dmgred(armor) {
		return 1 - 1 / (1 + Math.log(1 + armor / 1E4) / Math.log(2));
	}
	function speedred(def, atk, weight) {
		var a = def / atk * 4.6 / Math.log(weight) - 2;
		var b = 2 * a / (1 + Math.abs(2 * a));
		return .5 * (1.1 - .9 * b);
	}
	function fleetBonus(fleet) {
		var bonus = {
			power: 1,
			armor: 1,
			hp: 1,
			speed: 1,
			shield: 1,
		};
		var exp = fleet.exp;
		if(isNaN(exp)) exp = 0;
		else if(exp>MAX_FLEET_EXPERIENCE) exp = MAX_FLEET_EXPERIENCE;
		var expBonus = 1 + exp / 2000;
		bonus.power *= expBonus
		bonus.armor *= expBonus
		bonus.hp *= expBonus
		bonus.shield *= expBonus
		
		return bonus;
	}
	function fleetStats(fleet, enemy) {
		var power = 0,
		    armor = 0,
		    hp = 0,
		    threat = 0,
		    toughness = 0,
		    piercepower = 0,
		    speedpower = 0,
		    speedtough = 0,
		    rawpower = 0,
		    rawtough = 0;
		var bonus = fleetBonus(fleet);
		fleet.ships.map(function(n, k) {
			if(n == 0) return;
			var ship = ships[k];
			power += n * ship.power * bonus.power;
			piercepower += power * (ship.piercing || 0) / 100,
			armor += n * ship.armor * bonus.armor;
			hp += n * ship.hp * bonus.hp;
			var shiptough = ship.hp * bonus.hp / (1 - dmgred(ship.armor * bonus.armor));
			var piercingbonus = Math.min(1 + 10 * (ship.piercing || 0) / 100, 10);
			threat += (n+1) * ship.power * bonus.power;
			toughness += n * shiptough;
			speedpower += (n+1) * ship.power * piercingbonus * bonus.power * speedred(1, ship.speed * bonus.speed, 100000);
			speedtough += n * shiptough / speedred(ship.speed * bonus.speed, 1, ship.combatWeight);
		});
		return {
			Power: power,
			"Piercing Power": piercepower,
			Armor: armor,
			HP: hp,
			Toughness: toughness,
			Value: Math.sqrt(speedpower * speedtough),
		};
	}
	
	var saveData;
	try {
		saveData = JSON.parse(localStorage.getItem("buildingcalc-persist")) || {};
	} catch(e) {
		console.log(e);
		saveData = {};
	};
	window.history.replaceState(saveData, document.title, window.location.pathname);
	
	var cellWidth = 200;
	var tableWidth = 200;
    var buildingCalcTable = document.createElement("TABLE");
    buildingCalcTable.setAttribute("id", "buildingCalcTable");
	buildingCalcTable.planets = [];
	buildingCalcTable.buildings = [];
    document.getElementById("buildingtable").appendChild(buildingCalcTable);
	
	var thead = el("thead");
    thead.setAttribute("id", "thead");
    document.getElementById("buildingCalcTable").appendChild(thead);

    var headRow = tr();
    headRow.setAttribute("id", "headRow");
    document.getElementById("thead").appendChild(headRow);

    var tableFirstCell = th();
	tableFirstCell.setAttribute("width", cellWidth);
	tableWidth += cellWidth;
    var tableFirstTextNode = txt("Resource/Planet");
    tableFirstCell.appendChild(tableFirstTextNode);
    document.getElementById("headRow").appendChild(tableFirstCell);
	
	planets.map(function(planet){
		if(!planet.x || !planet.y || planet.info["orbit"] == 0)
			return;
		for(var pushedPlanetIndex = 0; pushedPlanetIndex < buildingCalcTable.planets.length; pushedPlanetIndex++) {
			if(buildingCalcTable.planets[pushedPlanetIndex].name == planet.name) {
				buildingCalcTable.planets[pushedPlanetIndex] = planet;
				return;
			}
		}
		buildingCalcTable.planets.push(planet);
	});
		
	buildingCalcTable.planets.sort(function(planetA, planetB) {
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
	
	buildingCalcTable.planets.map(function(planet){
		var planetNameCell = th();
		planetNameCell.setAttribute("width", cellWidth);
		tableWidth += cellWidth;
		var tableFirstTextNode = txt(planet.name);
		planetNameCell.appendChild(tableFirstTextNode);
		document.getElementById("headRow").appendChild(planetNameCell);
	})
	
	var tbody = el("tbody");
    tbody.setAttribute("id", "tbody");
    document.getElementById("buildingCalcTable").appendChild(tbody);
	
	buildings.map(function(building) {
		if(building.displayName == "placeholder")
			return;
			
		for(var requiredResearch in building.researchReq) {
			if(!researches[researchesName[requiredResearch]].pos || requiredResearch == "demographics" || requiredResearch == "energetics")
				return;
		}
			
		buildingCalcTable.buildings.push(building);
	})
	buildingCalcTable.buildings.map(function(building){
		for(var resourceIndex=0;resourceIndex<resNum;resourceIndex++){
			var resourceFirstPlanet = true;
			if(0!=building.resourcesProd[resourceIndex]&&(0<building.resourcesProd[resourceIndex])){
				var resource = resources[resourceIndex];
				var buildingResourceRow = tr();
				buildingResourceRow.setAttribute("id", "tr_" + building.id + "_" + resource.id);
				document.getElementById("tbody").appendChild(buildingResourceRow);
				var buildingResourceCell = td();
				buildingResourceCell.setAttribute("width", cellWidth);
				var buildingResourceNode = txt(building.displayName + "(" + resource.name.capitalize() + ")");
				buildingResourceCell.appendChild(buildingResourceNode);
				document.getElementById("tr_" + building.id + "_" + resource.id).appendChild(buildingResourceCell);
				buildingCalcTable.planets.map(function(planet){
					var inputCell = td();
					inputCell.setAttribute("width", cellWidth);
					if((0<planet.baseResources[resourceIndex])){
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
		if(building.researchPoint > 0) {
			var buildingResourceRow = tr();
			buildingResourceRow.setAttribute("id", "tr_" + building.id);
			document.getElementById("tbody").appendChild(buildingResourceRow);
			var buildingResourceCell = td();
			buildingResourceCell.setAttribute("width", cellWidth);
			var buildingResourceNode = txt(building.displayName + "(Research Points)");
			buildingResourceCell.appendChild(buildingResourceNode);
			document.getElementById("tr_" + building.id).appendChild(buildingResourceCell);
			buildingCalcTable.planets.map(function(planet){
				var inputCell = td();
				inputCell.setAttribute("width", cellWidth);
				for(var environmentIndex=0;environmentIndex<building.environment.length;environmentIndex++)
					if(building.environment[environmentIndex]==planet.type){
						var input = el("input");
						input.setAttribute("id", "input_" + planet.id + "_" + building.id);
						input.type = "text";
						input.disabled = !resourceFirstPlanet;
						input.required = resourceFirstPlanet;
						input.value = 0;
						if(saveData.buildingLevels && saveData.buildingLevels["input_" + planet.id + "_" + building.id]) input.value = saveData.buildingLevels["input_" + planet.id + "_" + building.id];
						resourceFirstPlanet = false;
						var planetInput = input;
						inputCell.setAttribute("id", "td_" + planet.id + "_" + building.id);
						inputCell.appendChild(planetInput);
					}
				document.getElementById("tr_" + building.id).appendChild(inputCell);
			})
		}
	})
	
	buildingCalcTable.setAttribute("width", tableWidth);
	
	window.onpopstate = function() {
		saveData = e.state;
		if(!saveData) return;

		loadSaveData(saveData);

		update();
	};
	
	function loadSaveData(saveData) {
		saveData.buildingLevels && arr(document.getElementsByTagName("input")).map(function(input) {
			if(input.disabled) return;
			input.value = saveData.buildingLevels[input.id] || "";
		});
	}
	
    var update = document.getElementById("buildingcalc").onchange = function() {
		saveData = {
			buildingLevels: {},
		};
		buildingCalcTable.buildings.map(function(building){
			for(var resourceIndex=0;resourceIndex<resNum;resourceIndex++){
				var resourceFirstPlanet = true;
				var resourceCostInput = Array(resNum);
				var buildingLevel;
				if(0!=building.resourcesProd[resourceIndex]&&(0<building.resourcesProd[resourceIndex])){
					var resource = resources[resourceIndex];
					buildingCalcTable.planets.map(function(planet){
						if((0<planet.baseResources[resourceIndex])){
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
			if(building.researchPoint > 0) {
				buildingCalcTable.planets.map(function(planet){
					for(var environmentIndex=0;environmentIndex<building.environment.length;environmentIndex++)
						if(building.environment[environmentIndex]==planet.type){
							var input = document.getElementById("input_" + planet.id + "_" + building.id);
							if(resourceFirstPlanet){
								buildingLevel = input.value;
								for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++) {
									resourceCostInput[resourceCostIndex] = Math.floor(building.resourcesCost[resourceCostIndex]*Math.pow(building.resourcesMult[resourceCostIndex],buildingLevel));
									if(building.name == "cryolab")
										resourceCostInput[resourceCostIndex] = resourceCostInput[resourceCostIndex] / (planet.info["temp"] * -5);
									if(building.name == "lavaresearch")
										resourceCostInput[resourceCostIndex] = resourceCostInput[resourceCostIndex] / planet.info["temp"];
								}
								resourceFirstPlanet = false;
							} else {
								var efficientBuildingLevels = [];
								for(var resourceCostIndex = 0; resourceCostIndex<resNum; resourceCostIndex++){
									if(resourceCostInput[resourceCostIndex]==0) continue;
									var efficientBuildingLevel = 0;
									var resourceCost = Math.floor(building.resourcesCost[resourceCostIndex]*Math.pow(building.resourcesMult[resourceCostIndex],efficientBuildingLevel));
									var inputResourceCost = resourceCostInput[resourceCostIndex];
									if(building.name == "cryolab")
										inputResourceCost = inputResourceCost * planet.info["temp"] * -5;
									if(building.name == "lavaresearch")
										inputResourceCost = inputResourceCost * planet.info["temp"];
									while(inputResourceCost>resourceCost){
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
				})
			}
		})
		
		arr(document.getElementsByTagName("input")).map(function(input) {
			if(input.disabled) return;
			var val = input.value;
			if(val > 0) saveData.buildingLevels[input.id] = val;
		});
		
		localStorage.setItem("buildingcalc-persist", JSON.stringify(saveData));
	}
	update();
});