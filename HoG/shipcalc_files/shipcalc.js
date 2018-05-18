document.addEventListener("DOMContentLoaded", function() {
	'use strict';

	function arr(v) { return Array.prototype.slice.call(v); }
	function appendTo(a) { return function(b) { return a.appendChild(b); }; }
	function el(tag, contents) { var el = document.createElement(tag); if(contents) contents.map(appendTo(el)); return el; }
	function txt() { return document.createTextNode(arr(arguments).join()); }
	function div() { return el("div", arr(arguments)); }
	function span() { return el("span", arr(arguments)); }
	function label() { return el("label", arr(arguments)); }

	function selectElementContents(el) {
		if (window.getSelection && document.createRange) {
			var sel = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(el);
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.selection && document.body.createTextRange) {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.select();
		}
	}

	function shipStats(fleet, shipIndex, shipAmount) {
		var power = 0,
		    armor = 0,
		    hp = 0,
		    toughness = 0,
		    piercepower = 0,
		    speedpower = 0,
		    speedtough = 0,
		    rawpower = 0,
		    rawtough = 0;
		var ship = ships[shipIndex];
		power += shipAmount * ship.power;
		piercepower += power * (ship.piercing || 0) / 100,
		armor += shipAmount * ship.armor;
		hp += shipAmount * ship.hp;
		var shiptough = ship.hp / (1 - dmgred(ship.armor));
		var piercingbonus = Math.min(1 + 10 * (ship.piercing || 0) / 100, 10);
		toughness += shipAmount * shiptough;
		speedpower += (shipAmount+1) * ship.power * piercingbonus;
		speedtough += shipAmount * shiptough;
		return {
			Power: power,
			"Piercing Power": piercepower,
			Armor: armor,
			HP: hp,
			Toughness: toughness,
			Value: Math.sqrt(speedpower * speedtough),
		};
	}
	function shipinput(ship, n) {
		var label = span(txt(ship.name));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.ship = ship;
		if(typeof n !== "undefined") input.value = n;
		input.showRank = span();
		input.resourceLimit = span();
		input.resourceLimit.setAttribute("id", "resourceLimit");
		//input.disabled = true;
		return div(label, input, input.showRank, input.resourceLimit);
	}
	function resourceinput(resource, n) {
		var label = span(txt(resource.name.capitalize() + "/s"));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.resource = resource;
		input.setAttribute("id", "resource_" + resource.id);
		if(typeof n !== "undefined") input.value = n;
		return div(label, input);
	}
	function inputval(input) {
		delete input.title;
		input.setCustomValidity("");

		var value = input.value;
		try {
			value = eval(value);
		} catch(e) {
			input.title = e.message;
			input.setCustomValidity(e.message);
		}
		if(value) {
			if(input.resource)
				input.value = value;
			else
				input.value = parseInt(value);
		}
		
		if(input.resource)
			return parseFloat(value) || 0;
		else
			return parseInt(value) || 0;
	}
	function createImport() {
		var galaxyChooser = el("select");
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
			
		var importButton = el("input");
		importButton.type = "button";
		importButton.value = "Import Save";
		importButton.setAttribute("id", "impsave");
		
		document.getElementById("importlist").appendChild(div(galaxyChooser, importButton));
		
		document.getElementById("impsave").onclick = function(){
			importSave(document.getElementById("importError"));
				resourcesIdList.map(function(resourceId) {
					var da_nebulas = nebulas;
					var da_gameplanets = game.planets;
					var da_planets = planets;
					var resource = resources[resourceId];
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
					document.getElementById("resource_" + resource.id).value = Math.floor(m*100)/100;
				});
				["artofwar", "karan_artofwar", "protohalean_science"].map(function(name) {
					var research = researches[researchesName[name]];
					document.getElementById("research_" + research.id).value = game.researches[researchesName[name]].level;
				});
				["quris_value", "quris_honor", "quris_glory", "thoroid", "scepter"].map(function(name) {
					var artifact = artifacts[artifactsName[name]];
					document.getElementById("artifact_" + artifact.id).checked = artifacts[artifactsName[name]].possessed===true;
				});
			update();
		};
	}

	var saveData;
	try {
		saveData = /*history.state || */deserialize(window.location.hash.substring(1)) || JSON.parse(localStorage.getItem("shipcalc-persist")) || {};
	} catch(e) {
		console.log(e);
		saveData = {};
	};
	window.history.replaceState(saveData, document.title, window.location.pathname);

	var shipIndexList = [];
	var resourcesIdList = [];
	var shiplist = document.getElementById("shiplist");
	shiplist.appendChild(div(span(txt("Shiptype")), span(txt("Ships/day")), span(txt("Rank")), span(txt("Limit"))));
	game.ships.map(function(ship) {
		var n;
		if(ship.type === "Colonial Ship" || ship.type === "Cargoship") return;
		if(ship.name === "Koroleva" || ship.name === "Augustus" || ship.name === "Leonidas" || ship.name === "Alexander" || ship.name === "Cerberus" || ship.name === "Charon") return;
		shiplist.appendChild(shipinput(ship, n));
		shipIndexList.push(ship.id);
		for(var resId = 0; resId < ship.cost.length; resId++) {
			if(ship.cost[resId] > 0 && !resourcesIdList.includes(resId))
				resourcesIdList.push(resId);
		}
	});
	resourcesIdList.sort();

	var resourcelist = document.getElementById("resourcelist");
	resourcesIdList.map(function(resourceId) {
		var n;
		if(saveData.resources && saveData.resources[resourceId]) n = saveData.resources[resourceId];
		resourcelist.appendChild(resourceinput(resources[resourceId], n));
	});

	var stufflist = document.getElementById("stufflist");

	["artofwar", "karan_artofwar", "protohalean_science"].map(function(name) {
		var research = researches[researchesName[name]];
		var label = span(txt(research.name));
		var input = el("input");
		input.type = "text";
		input.name = name;
		input.setAttribute("id", "research_" + research.id);
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.research = research;
		return div(label, input);
	}).map(appendTo(stufflist));
	["quris_value", "quris_honor", "quris_glory", "thoroid", "scepter"].map(function(name) {
		var artifact = artifacts[artifactsName[name]];
		var label = span(txt(artifact.name));
		var input = el("input");
		input.type = "checkbox";
		input.name = name;
		input.setAttribute("id", "artifact_" + artifact.id);
		input.value = artifact.description;
		if(saveData.bonuses && saveData.bonuses[name]) input.checked = saveData.bonuses[name];
		input.artifact = artifact;
		return div(label, input);
	}).map(appendTo(stufflist));
	
	createImport();

	function loadSaveData(saveData) {
		saveData.resources && arr(resourcelist.getElementsByTagName("input")).map(function(input) {
			if(!input.resource) return;
			input.value = saveData.resources[input.resource.name] || "";
		});
		saveData.bonuses && arr(stufflist.getElementsByTagName("input")).map(function(input) {
			input.value = saveData.bonuses[input.name] || "";
		});
	}

	window.onhashchange = function() {
		saveData = deserialize(window.location.hash.substring(1));
		if(!saveData) return;

		loadSaveData(saveData);

		update();
	};

	window.onpopstate = function(e) {
		saveData = e.state;
		if(!saveData) return;

		loadSaveData(saveData);

		update();
	};

	var exporter = document.getElementById("exporter");
	exporter.onclick = function() {
		selectElementContents(this);
		if(document.execCommand) document.execCommand("copy");
	};

	var update = document.getElementById("shipcalc").onchange = function() {
		saveData = {
			resources: {},
			bonuses: {},
			ships: {},
		};

		var warfleet = new Fleet(0, "Simulation");
		
		arr(resourcelist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) saveData.resources[input.resource.id] = val;
		});
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = 0;
			if(input.research) {
				val = inputval(input);
				var newLevel = val;
				while(input.research.level > newLevel) { input.research.unbonus(); input.research.level--; }
				while(input.research.level < newLevel) { input.research.level++; input.research.bonus(); }
			} else if(input.artifact) {
				var newLevel = input.checked ? 1 : 0;
				while(input.artifact.possessed > newLevel) { input.artifact.unaction(); input.artifact.possessed--; }
				while(input.artifact.possessed < newLevel) { input.artifact.possessed++; input.artifact.action(); }
				saveData.bonuses[input.name] = input.checked;
			}
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		
		arr(shiplist.getElementsByTagName("input")).map(function(input) {
			var ship = input.ship;
			var label = input.label;
			label.title = "Power: " + beauty(ship.power);
			label.title += "\nPiercing: " + beauty((ship.piercing || 0));
			label.title += "\nShield: " + beauty(ship.shield);
			label.title += "\nArmor: " + beauty(ship.armor);
			label.title += "\nHP: " + beauty(ship.hp);
			label.title += "\nSpeed: " + beauty(ship.speed);
			label.title += "\nWeight: " + beauty(ship.combatWeight);
			label.title += "\n\nRequirements:";
			label.title += "\nShipyard: " + ship.req;
			for(var requiredResearch in ship.resReq){
				label.title += "\n" + game.researches[researchesName[requiredResearch]].name + ": " + ship.resReq[requiredResearch];
			}
			label.title += "\n\nCost:"
			for(var requiredResourceIndex in ship.cost){
				if(ship.cost[requiredResourceIndex]>0)
					label.title += "\n" + resources[requiredResourceIndex].name.capitalize() + ": " + beauty(ship.cost[requiredResourceIndex]);
			}
			var affordableShipsAmount = [];
			var limitingResource = {
				resourceName: "",
				shipsPerDay: -1,
			};
			ships[input.ship.id].cost.map(function(resourceCost, resourceIndex) {
				if(!resourceCost) return;
				var availableResourcesPerDay = saveData.resources[resources[resourceIndex].id] * 60 * 60 * 24 || 0;
				var shipsPerDay = Math.round(availableResourcesPerDay / resourceCost * 100) / 100;
				if(limitingResource.shipsPerDay == -1 || limitingResource.shipsPerDay > shipsPerDay) {
					limitingResource.resourceName = resources[resourceIndex].name;
					limitingResource.shipsPerDay = shipsPerDay;
				}
				affordableShipsAmount.push(shipsPerDay);
			});
			affordableShipsAmount.sort(function(a, b) {
				return a - b;
			});
			warfleet.ships[input.ship.id] = affordableShipsAmount[0] || 0;
			input.value = beauty(affordableShipsAmount[0]) || 0;//warfleet.ships[input.ship.id];
			input.resourceLimit.innerText = limitingResource.resourceName.capitalize();
		});
		shipIndexList.sort(function(shipIndex2, shipIndex1) {
			var val1, val2;
			val1 = shipStats(warfleet, shipIndex1, warfleet.ships[shipIndex1]).Value;
			val2 = shipStats(warfleet, shipIndex2, warfleet.ships[shipIndex2]).Value;
			return val1 - val2;
		})
		
		var ranking = [];
		for(var rankIndex = 0; rankIndex<shipIndexList.length; rankIndex++) {
			ranking[shipIndexList[rankIndex]] = rankIndex+1;
		}
		
		arr(shiplist.getElementsByTagName("input"))
			.map(function(input) {
				if(input.type === "button") return;
				input.showRank.innerText = ranking[input.ship.id];
			});

		var basePath = location.protocol+'//'+location.host+location.pathname;
		exporter.href = exporter.firstChild.alt = basePath+"#"+serialize(saveData);
		window.history.replaceState(saveData, document.title, window.location.hash ? exporter.href : window.location.pathname);
		localStorage.setItem("shipcalc-persist", JSON.stringify(saveData));
	};
	update();
	
});