battlecalc_save_name=['HoG_Battlecalc','HoG_Battlecalc1','HoG_Battlecalc2'];

document.addEventListener("DOMContentLoaded", function() {
	'use strict';

	var lastChangedInput;
	
	$("body").keydown(function(e){
		var yKey = 89;
		var zKey = 90;
		if ((e.ctrlKey || e.metaKey) && (e.keyCode == zKey || e.keyCode == yKey)) {
			if(!lastChangedInput)
				return;
			lastChangedInput.focus();
		}
		
	});
	$("body").keyup(function(e){
		var tabKey = 9;
		if(e.keyCode == tabKey) {
			var activeElement = document.activeElement;
			activeElement.setSelectionRange(0, activeElement.value.length);
		}
		
	})

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

	function shipSummaryData(ship, friend, foe) {
		var shipStats = {
			Power: ship.power,
			Damage: 0,
			Piercing: (ship.piercing || 0),
			Shield: ship.shield,
			Armor: ship.armor,
			HP: ship.hp,
			"Piercing Power": ship.power * Math.min((ship.piercing || 0) / 100, 1),
			Toughness: ship.hp / (1 - dmgred(ship.armor)),
			Speed: ship.speed,
			Weight: ship.combatWeight,
		};
		if(friend) {
			var bonus = fleetBonus(friend);
			var fleetWeight = friend.combatWeight();
			shipStats.Power *= bonus.power;
			shipStats.Damage = shipStats.Power * bonus.damage;
			shipStats.Armor *= bonus.armor;
			shipStats.Shield *= bonus.shield;
			shipStats.HP *= bonus.hp;
			shipStats["Piercing Power"] *= bonus.power;
			shipStats.Toughness = shipStats.HP / (1 - dmgred(shipStats.Armor));
			shipStats.Speed *= bonus.speed;
			shipStats.Duration = (1 + fleetWeight / ship.combatWeight);
		}
		if(foe) {
			var bonus = fleetBonus(foe);
			var fleetWeight = foe.combatWeight();
			var netEffect = foe.ships.map(function(n, k) {
				if(n == 0) return {};
				var enemyShip = ships[k];
				var result = {};
				var shipDR = Math.min(shipStats.HP / shipStats.Toughness + (enemyShip.piercing || 0) / 100, 1);
				var enemyDR = Math.min(1 - dmgred(enemyShip.armor * bonus.armor) + (shipStats.Piercing) / 100, 1);
				result.power = n * enemyShip.power * bonus.power * bonus.damage;
				result.harm = speedred(shipStats.Speed, enemyShip.speed * bonus.speed, shipStats.Weight) * result.power * shipDR / shipStats.HP;
				result.toughness = n * enemyShip.hp / (1 - dmgred(enemyShip.armor * bonus.armor));
				var piercingBonus = result.toughness * enemyDR / (n * enemyShip.hp);
				var modifiedPower = speedred(enemyShip.speed * bonus.speed, shipStats.Speed, enemyShip.combatWeight) * piercingBonus * shipStats.Damage;
				result.effect = result.toughness / modifiedPower;
				if(isNaN(result.harm)) result.harm = Infinity;
				if(isNaN(result.effect)) result.effect = 0;
				return result;
			}).reduce(function(obj, v) {
				for(var k in v) obj[k] += v[k];
				return obj;
			}, {
				power: 0,
				harm: 0,
				toughness: 0,
				effect: 0,
			});
			if(netEffect.harm) shipStats["Adjusted Toughness"] = netEffect.power / netEffect.harm;
			if(netEffect.harm && shipStats.Duration) shipStats.Duration /= netEffect.harm;
			if(netEffect.effect) shipStats["Killing Power"] = netEffect.toughness / netEffect.effect;
		}
		return shipStats;
	}
	function shipSummary(ship, friend, foe) {
		var shipStats = shipSummaryData(ship, friend, foe)
		var fleetStats = friend ? fleetSummaryData(friend, foe) : {};
		if(ship.id == 14) {
			if(friend) {
				var precount = friend.ships[ship.id];
				var bonusChange = (1 + .1 * Math.log2(2 + precount)) / (1 + .1 * Math.log2(1 + precount));
				shipStats.Power *= bonusChange;
				shipStats.Power += fleetStats.Power * (bonusChange - 1);
				shipStats["Killing Power"] *= bonusChange;
				shipStats["Killing Power"] += fleetStats["Killing Power"] * (bonusChange - 1);
			} else {
				shipStats.Power *= 1.1;
				shipStats["Killing Power"] *= 1.1;
			}
		}
		for(var k in fleetStats) if(fleetStats[k]) shipStats[k] = beauty(shipStats[k])+" ("+beauty(friend.ships[ship.id] * shipStats[k] / fleetStats[k] * 100)+"%)";
		return beautyObj(shipStats);
	}
	function fleetSummaryData(friend, foe) {
		return friend.ships.map(function(n, k) {
			if(n == 0) return false;
			var ship = ships[k];
			var shipStats = shipSummaryData(ship, friend, foe);
			shipStats.Count = n;
			return shipStats;
		}).filter(Boolean).map(function(v) {
			for(var k in v) v[k] *= v.Count;
			delete v.Speed; delete v.Duration; delete v.Count;
			return v;
		}).reduce(function(obj, v) {
			for(var k in v) 
				if(obj[k]==0)
					obj[k] += v[k];
			return obj;
		}, {
			Power: friend.power(),
			Armor: friend.armor(),
			HP: friend.hp(),
			Toughness: 0,
			"Piercing Power": 0,
			"Adjusted Toughness": 0,
			Weight: friend.weight(),
			"Killing Power": 0,
			"Military Value": friend.value(),
		});
	}
	function writeFleetSummary(container, friend, foe) {
		while(container.lastChild) container.removeChild(container.lastChild);

		var fleetData = fleetSummaryData(friend, foe);
		var tooltips = {
			Power: "Total Power of all ships in fleet",
			Armor: "Total Armor of all ships in fleet",
			HP: "Total HP of all ships in fleet",
			Toughness: "Effective HP of fleet after Armor bonuses",
			"Piercing Power": "Amount of direct HP damage this fleet deals due to armor piercing",
			"Adjusted Toughness": "Total amount of raw Power this fleet can absorb before dying",
			Weight: "Total mass of ships damage is spread across (helps to keep weaker ships alive)",
			"Killing Power": "Progress toward killing the enemy outright (opposes enemy Toughness)",
			"Military Value": "The Military Value of the Fleet (really only used for sorting)",
		};
		for(var k in fleetData) {
			if(!tooltips[k]) continue;
			var v = fleetData[k];
			var row = div(txt(k + ": " + (typeof v === "number" ? beauty(v) : v)));
			row.title = tooltips[k];
			container.appendChild(row);
		}
	}
	function fleetBonus(fleet) {
		var bonus = {
			power: 1,
			damage: 1,
			armor: 1,
			hp: 1,
			speed: 1,
			shield: 1,
		};
		if(fleet.civis==0) {
			["ammunition", "u-ammunition", "t-ammunition"].map(function(name) {
				var resource = resourcesName[name];
				bonus.power += calcBonus[name](fleet.storage[resource.id]);
			});
			bonus.power *= (1 + .1 * Math.log(1 + fleet.ships[14]) / Math.log(2));
			["armor"].map(function(name) {
				var resource = resourcesName[name];
				bonus.armor += calcBonus[name](fleet.storage[resource.id]);
			});
			["engine"].map(function(name) {
				var resource = resourcesName[name];
				bonus.speed += calcBonus[name](fleet.storage[resource.id]);
			});
			
			["exp"].map(function(name) {
				var exp = fleet.exp || parseInt(document.getElementsByName(name)[0].value);
				if(isNaN(exp)) exp = 0;
				// else if(exp>MAX_FLEET_EXPERIENCE) exp = MAX_FLEET_EXPERIENCE;
				bonus.power *= calcBonus[name](exp);
				bonus.armor *= calcBonus[name](exp);
				bonus.hp *= calcBonus[name](exp);
				bonus.shield *= calcBonus[name](exp);
			});
		}
		if(fleet.civis==1) {
			["enemy_exp"].map(function(name) {
				var enemyExp = fleet.exp || parseInt(document.getElementsByName(name)[0].value);
				if(isNaN(enemyExp)) enemyExp = 0;
				// else if(enemyExp>MAX_FLEET_EXPERIENCE) enemyExp = MAX_FLEET_EXPERIENCE;
				bonus.power *= calcBonus[name](enemyExp);
				bonus.armor *= calcBonus[name](enemyExp);
				bonus.hp *= calcBonus[name](enemyExp);
				bonus.shield *= calcBonus[name](enemyExp);
			});
		}
		
		return bonus;
	}
	function shipinput(ship, n) {
		var label = span(txt(ship.name));
		label.title = shipSummary(ship);
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.ship = ship;
		input.onfocus = function() {
			parseSeperatedInput(input);
		};
		input.onblur = function() {
			addSeperatorsToInput(input)
		};
		if(typeof n !== "undefined") input.value = n;
		input.showShipsLeftOrShipsLost = span();
		return div(label, input, input.showShipsLeftOrShipsLost);
	}
	function shipselector(available_ships) {
		var pick_new_ship = el("select");
		available_ships.map(function(ship, k) {
			var option = el("option");
			option.value = k;
			option.innerText = ship.name;
			option.ship = ship;
			return option;
		}).map(appendTo(pick_new_ship));
		var add_new_ship = el("input");
		add_new_ship.type = "button";
		add_new_ship.value = "Add Ship";
		var clearFleetButton = el("input");
		clearFleetButton.type = "button";
		clearFleetButton.value = "Clear All";
		var row = div(span(pick_new_ship), add_new_ship, clearFleetButton);
		add_new_ship.onclick = function() {
			var i = pick_new_ship.selectedIndex;
			if(i == -1) return;
			var o = pick_new_ship.options[i];
			var parent = row.parentNode;
			parent.removeChild(row);
			parent.appendChild(shipinput(o.ship));
			delete available_ships[o.value];
			parent.insertBefore(shipselector(available_ships), parent.firstChild);
		};
		clearFleetButton.onclick = function() {
			var parent = row.parentNode;
			arr(parent.getElementsByTagName("input")).map(function(input) {
				if(input.type === "button") return;
				input.value = "";
			});
			update();
		};
		return row;
	}
	function feelin_lucky(enemypicker) {
		var label = span(txt("Battlepoints"));
		var feelin_lucky_input = el("input");
		var feelin_lucky_button = el("input");
		feelin_lucky_button.type = "button";
		feelin_lucky_button.value = "I'm Feelin' Lucky!";
		var row = div(label, span(feelin_lucky_input), feelin_lucky_button);
		feelin_lucky_button.onclick = function() {
			var option = enemypicker.options[enemypicker.selectedIndex]
			var generatedFleetSub = null;
			var attempts = 0;
			while(generatedFleetSub == null && attempts < 100)
			{
				generatedFleetSub = generateFleetSub(option.fleet.civis, 1E16*Math.pow(1.5,parseInt(feelin_lucky_input.value)), "Tournament Fleet");
			}
			var generatedFleet;
			if(generatedFleetSub == null)
			{
				generatedFleet = new Fleet(option.fleet.civis," Tournament Fleet"),civis[option.fleet.civis].ships[0]&&(generatedFleet.ships[civis[option.fleet.civis].ships[0].id]=1);
			} else {
				generatedFleet = generatedFleetSub.f;
			}
			
			for(var shipId = 0; shipId < option.fleet.ships.length; shipId++)
			{
				option.fleet.ships[shipId] = generatedFleet.ships[shipId];
			}
			enemypicker.onchange();
			update();
		};
		return row;
	}
	function generateOptions() {
		var showShipsLeftOrShipsLostRadioName = "showShipsLeftOrShipsLost";
		["Show ships left", "Show ships lost", "Show % ships left", "Show % ships lost"].map(function(name) {
			var label = span(txt(name));
			var input = el("input");
			input.type = "radio";
			input.label = label;
			input.name = showShipsLeftOrShipsLostRadioName;
			input.value = name;
			if(name == "Show ships left") input.defaultChecked = true;
			if(saveData.options && saveData.options[showShipsLeftOrShipsLostRadioName] && saveData.options[showShipsLeftOrShipsLostRadioName] == input.value) input.defaultChecked = true;
			return div(label, input);
		}).map(appendTo(optionslist));
		["Show HP left in battle report"].map(function(name) {
			var label = span(txt(name));
			var input = el("input");
			input.type = "checkbox";
			input.label = label;
			input.name = name;
			input.value = name;
			if(saveData.options && saveData.options[name] && saveData.options[name] == input.value) input.defaultChecked = true;
			gameSettings.hpreport = input.checked;
			input.onclick = function() {
				gameSettings.hpreport = input.checked;
			};
			return div(label, input);
		}).map(appendTo(optionslist));
	}
	function inputval(input) {
		delete input.title;
		input.setCustomValidity("");

		var value = getNumberFromSeperatedString(input.value);
		
		if(input.type=="checkbox")
			if(input.checked)
				value=1;
			else
				value=0;
		try {
			value = eval(value);
		} catch(e) {
			input.title = e.message;
			input.setCustomValidity(e.message);
		}
		
		if(parseInt(value, 10))
			value = BigInteger.toJSValue(value);
			
		return value || 0;
	}

	var saveData;
	try {
		saveData = /*history.state || */deserialize(window.location.hash.substring(1)) || JSON.parse(localStorage.getItem("battlecalc-persist")) || {};
	} catch(e) {
		console.log(e);
		saveData = {};
	};
	window.history.replaceState(saveData, document.title, window.location.pathname);

	var shiplist = document.getElementById("shiplist");
	var available_ships = ships.slice();
	ships.map(function(ship) {
		if(!game.ships.includes(ship)) {
			delete available_ships[ship.id];
			return;
		}
		var n;
		if(saveData.ships && saveData.ships[ship.id]) n = saveData.ships[ship.id];
		else if(ship.type === "Colonial Ship" || ship.type === "Cargoship") return;
		shiplist.appendChild(shipinput(ship, n));
		delete available_ships[ship.id];
	});
	saveData.ships && Object.keys(saveData.ships).map(function(k) {
		if(!available_ships[k]) return;
		var n = saveData.ships[k];
		shiplist.appendChild(shipinput(ships[k], n));
		delete available_ships[k];
	});
	shiplist.insertBefore(shipselector(available_ships), shiplist.firstChild);

	shiplist.statBlock = span();
	shiplist.statBlock.className = "statblock";
	shiplist.statBlock.title = "Total resource value of your fleet";
	shiplist.parentNode.appendChild(shiplist.statBlock);
	shiplist.statBlockCombat = span();
	shiplist.statBlockCombat.className = "statblock combat";
	shiplist.parentNode.appendChild(shiplist.statBlockCombat);

	var misclist = document.getElementById("misclist");
	misclist.resultLabels = [];
	["turns", "berserk", "gamma ray bursts"].map(function(name) {
		var label = span(txt(name.capitalize() + ":"));
		var resultLabel = span();
		misclist.resultLabels[name] = resultLabel;
		return div(label, resultLabel);
	}).map(appendTo(misclist));
	
	
	var stufflist = document.getElementById("stufflist");

	["influence"].map(function(name) {
		var label = span(txt(name.capitalize()));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		game.influence = function() {
			return getNumberFromSeperatedString(input.value);
		};
		input.onfocus = function() {
			parseSeperatedInput(input);
		};
		input.onblur = function() {
			addSeperatorsToInput(input)
		};
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.showValue = span();
		return div(label, input, input.showValue);
	}).map(appendTo(stufflist));
	
	var govSelectLabel = span(txt("Government"));
	
	var govSelect = el("select");
	for (var government in governmentList) {
		var option = el("option");
		option.value = government;
		option.innerText = government;
		govSelect.appendChild(option);
	}
	
	govSelect.onchange = function() {
		var i = govSelect.selectedIndex;
		if(game.chosenGovern)
			governmentList[game.chosenGovern].unbonus();
		game.chosenGovern = govSelect.options[i].value;
		governmentList[game.chosenGovern].bonus();
	};
	
	stufflist.appendChild(div(govSelectLabel, govSelect));
	
	
	["ammunition", "u-ammunition", "t-ammunition", "dark matter", "armor", "shield capsule", "engine"].map(function(name) {
		var resource = resourcesName[name];
		var label = span(txt(name.capitalize()));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		input.onfocus = function() {
			parseSeperatedInput(input);
		};
		input.onblur = function() {
			addSeperatorsToInput(input)
		};
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.resource = resource;
		input.showValue = span();
		return div(label, input, input.showValue);
	}).map(appendTo(stufflist));
	["exp"].map(function(name) {
		var label = span(txt(name.capitalize()));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		input.onfocus = function() {
			parseSeperatedInput(input);
		};
		input.onblur = function() {
			addSeperatorsToInput(input)
		};
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.showValue = span();
		return div(label, input, input.showValue);
	}).map(appendTo(stufflist));
	["artofwar", "karan_artofwar", "protohalean_science"].map(function(name) {
		var research = researches[researchesName[name]];
		var label = span(txt(research.name));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.research = research;
		return div(label, input);
	}).map(appendTo(stufflist));
	["quris_value", "quris_honor", "quris_glory", "thoroid", "scepter"].map(function(name) {
		var artifact = artifacts[artifactsName[name]];
		var label = span(txt(artifact.name));
		var input = el("input");
		input.type = "checkbox";
		input.label = label;
		input.name = name;
		input.value = artifact.description;
		if(saveData.bonuses && saveData.bonuses[name]) input.checked = saveData.bonuses[name]>0;
		input.artifact = artifact;
		return div(label, input);
	}).map(appendTo(stufflist));

	var enemystufflist = document.getElementById("enemystufflist");
	["enemy_exp"].map(function(name) {
		var label = span(txt("Enemy Exp"));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		input.onfocus = function() {
			parseSeperatedInput(input);
		};
		input.onblur = function() {
			addSeperatorsToInput(input)
		};
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.showValue = span();
		return div(label, input, input.showValue);
	}).map(appendTo(enemystufflist));
	var calcBonus = {
		"ammunition": function(v) { return 10 * Math.log(1 + v / 1E7)/Math.log(2); },
		"u-ammunition": function(v) { return 20 * Math.log(1 + v / 1E7)/Math.log(2); },
		"t-ammunition": function(v) { return 60 * Math.log(1 + v / 2E7)/Math.log(2); },
		"armor": function(v) { return v / 2e6; },
		"engine": function(v) { return v / 5e6; },
		"exp": function(v) { return 1+v/2000;},
		"enemy_exp": function(v) { return 1+v/2000;},
	};
	
	var optionslist = document.getElementById("optionslist");
	generateOptions();

	stufflist.statBlock = span();
	stufflist.statBlock.className = "statblock only storage";
	stufflist.parentNode.appendChild(stufflist.statBlock);
	var resourcelosses = span();
	resourcelosses.className = "statblock combat only";
	resourcelosses.title = "Total resources lost in this fight (ships and inventory)";
	stufflist.parentNode.appendChild(resourcelosses);

	
	var freeBattleFleets = [];
	for(var civisIndex = 1; civisIndex < civis.length; civisIndex++) {
		var freeBattleFleet=new Fleet(civis[civisIndex].id,"Tournament Fleet");
		for(var enemyTournamentShipIndex=0;enemyTournamentShipIndex<97;enemyTournamentShipIndex++){
			freeBattleFleet.ships[enemyTournamentShipIndex]=0;
		};
		freeBattleFleet.exp=0;
		planets[planetsName.teleras].fleetPush(freeBattleFleet);
	}
	freeBattleFleet=new Fleet(civis.length,"Customizable Fleet");
	for(var enemyTournamentShipIndex=0;enemyTournamentShipIndex<97;enemyTournamentShipIndex++){
		freeBattleFleet.ships[enemyTournamentShipIndex]=0;
	};
	freeBattleFleet.exp=0;
	planets[planetsName.teleras].fleetPush(freeBattleFleet);
	var feelinlucky = document.getElementById("feelinlucky");
	var enemylist = document.getElementById("enemylist");
	var enemy_available_ships;
	var enemy_available_tournament_ships;
	var enemypicker = el("select");
	planets.map(function(planet) {
		for(var k in planet.fleets) {
			var fleet = planet.fleets[k];
			if(!fleet.combatWeight()&&fleet.name!="Customizable Fleet"&&fleet.name!="Tournament Fleet") continue;
			var text = planet.name + " - " + fleet.name;
			var option = el("option");
			option.innerText = text;
			option.value = planet.id + "_" + k;
			option.fleet = fleet;
			if(fleet.name == "Customizable Fleet" || fleet.name == "Tournament Fleet"){
				option.innerText = "Free Battle" + " - " + fleet.name;
				if(fleet.name == "Tournament Fleet")
					option.innerText += ": " + civis[fleet.civis].name;
				option.value = "free_battle" + "_" + fleet.civis;
			}
			enemypicker.appendChild(option);
		}
	});
	arr(enemypicker.options)
		.sort(function(a, b) { return a.fleet.value() - b.fleet.value(); })
		.map(appendTo(enemypicker));
	enemylist.parentNode.insertBefore(div(span(txt("Enemy Fleet")), enemypicker), enemylist);
	if(isFinite(saveData.enemySelected)) enemypicker.selectedIndex = saveData.enemySelected;
	else if(saveData.enemySelected) enemypicker.value = saveData.enemySelected;
	enemypicker.onchange = function() {
		var i = enemypicker.selectedIndex;
		if(i == -1) return;
		var parent = enemypicker.parentNode;
		while(enemylist.lastChild) enemylist.removeChild(enemylist.lastChild);
		var o = enemypicker.options[i];
		enemy_available_ships = ships.slice();
		civis[0].ships.map(function(ship){
			delete enemy_available_ships[ship.id]
		});
		if(o.fleet.name=="Customizable Fleet"){
			enemy_available_ships.map(function(ship) {
				if(ship.type === "Colonial Ship" || ship.type === "Cargoship"){
					delete enemy_available_ships[ship.id];
				}
			});
			if(o.fleet.name=="Customizable Fleet"){
				enemylist.insertBefore(shipselector(enemy_available_ships), enemylist.firstChild);
			}
		}
		if(o.fleet.name=="Tournament Fleet" && !feelinlucky.lastChild)
			feelinlucky.appendChild(feelin_lucky(enemypicker));
		if(o.fleet.name!="Tournament Fleet")
			while(feelinlucky.lastChild)
				feelinlucky.removeChild(feelinlucky.lastChild);
		enemy_available_tournament_ships = ships.slice();
		civis[0].ships.map(function(ship){
			delete enemy_available_tournament_ships[ship.id]
		});
		o.fleet.ships.map(function(n, k) {
			if(!n&&o.fleet.name!="Tournament Fleet") return;
			var ship = ships[k];
			if(o.fleet.name=="Tournament Fleet"&&(ship.type=="Colonial Ship"||ship.type=="Cargoship"||!enemy_available_tournament_ships[k]||!civis[o.fleet.civis].ships.includes(ship))) return;
			enemylist.appendChild(shipinput(ship, n));
		});
		
		arr(enemystufflist.getElementsByTagName("input")).map(function(input) {
			if(input.name == "enemy_exp")
				input.value = o.fleet.exp;
		});
	};
	enemypicker.onchange();
	
	if(saveData.battlepoints) {
		arr(enemylist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			input.value = saveData.battlepoints;
		});
	}
	
	if(saveData.enemies) {
		arr(enemylist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			input.value = saveData.enemies[input.ship.id] || "";
			delete saveData.enemies[input.ship.id];
			delete enemy_available_ships[input.ship.id];
		});
		Object.keys(saveData.enemies).map(function(k) {
			if(!ships[k]) return;
			var n = saveData.enemies[k];
			delete enemy_available_ships[k];
			enemylist.appendChild(shipinput(ships[k], n));
		});
		if(enemypicker.options[enemypicker.selectedIndex].fleet.name=="Customizable Fleet"){
			enemylist.removeChild(enemylist.firstChild);
			enemylist.insertBefore(shipselector(enemy_available_ships), enemylist.firstChild);
		}
	}

	enemylist.statBlock = span();
	enemylist.statBlock.className = "statblock";
	enemylist.statBlock.title = "Total resource value of enemy fleet";
	enemylist.parentNode.appendChild(enemylist.statBlock);
	enemylist.statBlockCombat = span();
	enemylist.statBlockCombat.className = "statblock combat";
	enemylist.parentNode.appendChild(enemylist.statBlockCombat);

	function loadSaveData(saveData) {
		saveData.ships && arr(shiplist.getElementsByTagName("input")).map(function(input) {
			if(!input.ship) return;
			input.value = saveData.ships[input.ship.id] || "";
		});
		saveData.ships && Object.keys(saveData.ships).map(function(k) {
			if(!available_ships[k]) return;
			var n = saveData.ships[k] || "";
			shiplist.appendChild(shipinput(ships[k], n));
			delete available_ships[k];
		});
		saveData.bonuses && arr(stufflist.getElementsByTagName("input")).map(function(input) {
			input.value = saveData.bonuses[input.name] || "";
		});
		saveData.bonuses && arr(enemystufflist.getElementsByTagName("input")).map(function(input) {
			input.value = saveData.bonuses[input.name] || "";
		});
		if(saveData.enemySelected) {
			if(isFinite(saveData.enemySelected)) enemypicker.selectedIndex = saveData.enemySelected;
			else enemypicker.value = saveData.enemySelected;
			enemypicker.onchange();
		}
		saveData.battlepoints && arr(feelinlucky.getElementsByTagName("input")).map(function(input) {
			input.value = saveData.battlepoints || "";
		});
		saveData.enemies && arr(enemylist.getElementsByTagName("input")).map(function(input) {
			if(!input.ship) return;
			input.value = saveData.enemies[input.ship.id] || "";
			delete saveData.enemies[input.ship.id];
		});
		saveData.enemies && Object.keys(saveData.enemies).map(function(k) {
			if(!ships[k]||!enemy_available_ships[k]) return;
			var n = saveData.enemies[k] || "";
			enemylist.appendChild(shipinput(ships[k], n));
			delete enemy_available_ships[k];
		});
		if(enemypicker.options[enemypicker.selectedIndex].fleet.name=="Customizable Fleet"){
			enemylist.removeChild(enemylist.firstChild);
			enemylist.insertBefore(shipselector(enemy_available_ships), enemylist.firstChild);
		}
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

	var nextrun = document.getElementById("nextrun");
	if(window.name) nextrun.target = window.name+"+";

	var battlereport = document.getElementById("battlereport");
	var update = document.getElementById("battlecalc").onchange = function() {
		saveData = {
			ships: {},
			bonuses: {},
			options: {},
			enemies: {},
			battlepoints: 0,
		};

		var warfleet = new Fleet(0, "Simulation");
		
		arr(shiplist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) warfleet.ships[input.ship.id] = saveData.ships[input.ship.id] = val;
		});
		arr(feelinlucky.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) saveData.battlepoints = val;
		});
		// apply artifacts
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.artifact) {
				var newLevel = val;
				while(input.artifact.possessed > newLevel) { input.artifact.unaction(); input.artifact.possessed--; }
				while(input.artifact.possessed < newLevel) { input.artifact.possessed++; input.artifact.action(); }
			}
			
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		// apply researches
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.research) {
				var newLevel = val;
				while(input.research.level > newLevel) { input.research.unbonus(); input.research.level--; }
				while(input.research.level < newLevel) { input.research.level++; input.research.bonus(); }
			}
			
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		// apply resources
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.resource) {
				warfleet.storage[input.resource.id] = val;
				if(input.resource.name != "dark matter" && input.resource.name != "shield capsule")
					input.showValue.innerText = "+"+beauty(calcBonus[input.resource.name](warfleet.storage[input.resource.id])) + "x";
			}
			
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		// apply others
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.name == "exp") {
				if(input.value > MAX_FLEET_EXPERIENCE) {
					val = MAX_FLEET_EXPERIENCE;
					input.value = MAX_FLEET_EXPERIENCE;
				}
				warfleet.exp = val;
			}
			
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		arr(optionslist.getElementsByTagName("input")).map(function(input) {
			if(input.checked) saveData.options[input.name] = input.value;
		});
		
		
		var enemy = new Fleet(1, "Test Dummy");
		saveData.enemySelected = enemypicker.value;
		arr(enemylist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) enemy.ships[input.ship.id] = saveData.enemies[input.ship.id] = val;
		});
		
		var enemyexp = inputval(document.getElementsByName("enemy_exp")[0]);
		if(isNaN(enemyexp)) enemyexp = 0;
 		enemy.exp = enemyexp;

		arr(stufflist.getElementsByTagName("input")).filter(function(input) {
			return input.resource && input.label;
		}).reduce(function(fleetRealStats, input) {
			var val = warfleet.storage[input.resource.id];
			warfleet.storage[input.resource.id]++;
			var fleetPlusStats = fleetSummaryData(warfleet, enemy);
			warfleet.storage[input.resource.id] = 0;
			var fleetPreStats = fleetSummaryData(warfleet, enemy);
			warfleet.storage[input.resource.id] = val;

			var changes = {};
			for(var k in fleetRealStats) {
				var a = fleetPreStats[k],
				    b = fleetRealStats[k] - a,
				    c = fleetPlusStats[k] - a - b;
				if(b || c) changes[k] = beauty(b) + " (+" + beauty(c) + ")";
			}
			input.label.title = beautyObj(changes);

			return fleetRealStats;
		}, fleetSummaryData(warfleet, enemy));
		
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			if(input.name == "exp") {
				input.label.title = "Each Exp increases all shipstats by 0.05%\nMaximum Exp: " + MAX_FLEET_EXPERIENCE;
			} else if(input.research) {
				var researchDescription = input.research.extraDescription();
				var splitString = researchDescription.split(new RegExp("<[b][r]>"));
				researchDescription = splitString.join("\n");
				splitString = researchDescription.split(new RegExp("<[^>]*>"));
				var researchTitle = splitString.join("");
				input.label.title = researchTitle;
			} else if(input.artifact) {
				var artifactDescription = input.artifact.description;
				var splitString = artifactDescription.split(new RegExp("<[b][r]>"));
				artifactDescription = splitString.join("\n");
				splitString = artifactDescription.split(new RegExp("<[^>]*>"));
				var artifactTitle = splitString.join("");
				input.label.title = artifactTitle;
			} else if(input.resource) {
				if(warfleet.maxStorage < warfleet.usedStorage)
					input.setCustomValidity("Not enough Storage!");
			}
		});

		shiplist.statBlock.innerText = beautyObj(warfleet.ships.reduce(function(obj, n, k) {
			if(n === 0) return obj;
			ships[k].cost.map(function(v, i) {
				if(!v) return;
				var resName = resources[i].name.capitalize();
				obj[resName] = (obj[resName] || 0) + n * v;
			})
			return obj;
		}, {}));
		writeFleetSummary(shiplist.statBlockCombat, warfleet, enemy);
		var maxStorage = warfleet.maxStorage(),
			usedStorage = warfleet.usedStorage(),
			survivingStorage = 0;
		enemylist.statBlock.innerText = beautyObj(enemy.ships.reduce(function(obj, n, k) {
			if(n === 0) return obj;
			ships[k].cost.map(function(v, i) {
				if(!v) return;
				var resName = resources[i].name.capitalize();
				obj[resName] = (obj[resName] || 0) + n * v;
			})
			return obj;
		}, {}));
		writeFleetSummary(enemylist.statBlockCombat, enemy, warfleet);

		var warfleetNetWorth = warfleet.ships.reduce(function(arr, n, k) {
			if(n === 0) return arr;
			ships[k].cost.map(function(v, i) {
				arr[i] += n * v;
			})
			return arr;
		}, warfleet.storage.slice());

		arr(shiplist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			input.label.title = shipSummary(input.ship, warfleet, enemy);
		});
		arr(enemylist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			input.label.title = shipSummary(input.ship, enemy, warfleet);
		});

		var playerShipsBeforeFight = warfleet.ships.slice();
		var enemyShipsBeforeFight = enemy.ships.slice();
		
		enemy.battle(warfleet, !0);
		var battle = enemy.battle(warfleet);
		battlereport.innerHTML = battle.r;
		
		
		["turns", "berserk", "gamma ray bursts"].map(function(name) {
			var report = battle.r;
			if(name != "turns") {
				if(!report.includes(name)) {
					misclist.resultLabels[name].innerHTML = "false";
					return;
				}
			}
			var reportArray = report.split(name)[0].split("TURN");
			misclist.resultLabels[name].innerHTML = reportArray.length - 1;
		});
		
		arr(shiplist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			if(saveData.options["showShipsLeftOrShipsLost"] == "Show ships left") {
				var shipsLeft = warfleet.ships[input.ship.id]
				var shipsLeftText = shipsLeft >= 1000 ? beauty(shipsLeft) : shipsLeft;
				input.showShipsLeftOrShipsLost.innerText = shipsLeftText;
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show ships lost") {
				var shipsLost = playerShipsBeforeFight[input.ship.id] - warfleet.ships[input.ship.id];
				var shipsLostText = shipsLost >= 1000 ? beauty(shipsLost) : shipsLost;
				input.showShipsLeftOrShipsLost.innerText = "-" + shipsLostText;
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show % ships left") {
				var shipsLeft = warfleet.ships[input.ship.id]
				var percentLeft = Math.floor((((shipsLeft / playerShipsBeforeFight[input.ship.id]) || 0) * 100) * 100) / 100;
				input.showShipsLeftOrShipsLost.innerText = percentLeft + "%";
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show % ships lost") {
				var shipsLost = playerShipsBeforeFight[input.ship.id] - warfleet.ships[input.ship.id];
				var percentLost = Math.floor(((shipsLost / playerShipsBeforeFight[input.ship.id] || 0) * 100) * 100) / 100;
				input.showShipsLeftOrShipsLost.innerText = "-" + percentLost + "%";
			}
		});
		shiplist.dataset.weightRemaining = warfleet.combatWeight();
		arr(enemylist.getElementsByTagName("input")).map(function(input) {
			if(input.type === "button") return;
			if(saveData.options["showShipsLeftOrShipsLost"] == "Show ships left") {
				var shipsLeft = enemy.ships[input.ship.id]
				var shipsLeftText = shipsLeft >= 1000 ? beauty(shipsLeft) : shipsLeft;
				input.showShipsLeftOrShipsLost.innerText = shipsLeftText;
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show ships lost") {
				var shipsLost = enemyShipsBeforeFight[input.ship.id] - enemy.ships[input.ship.id];
				var shipsLostText = shipsLost >= 1000 ? beauty(shipsLost) : shipsLost;
				input.showShipsLeftOrShipsLost.innerText = "-" + shipsLostText;
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show % ships left") {
				var shipsLeft = enemy.ships[input.ship.id]
				var percentLeft = Math.floor((((shipsLeft / enemyShipsBeforeFight[input.ship.id]) || 0) * 100) * 100) / 100;
				input.showShipsLeftOrShipsLost.innerText = percentLeft + "%";
			}
			else if (saveData.options["showShipsLeftOrShipsLost"] == "Show % ships lost") {
				var shipsLost = enemyShipsBeforeFight[input.ship.id] - enemy.ships[input.ship.id];
				var percentLost = Math.floor(((shipsLost / enemyShipsBeforeFight[input.ship.id] || 0) * 100) * 100) / 100;
				input.showShipsLeftOrShipsLost.innerText = "-" + percentLost + "%";
			}
		});
		enemylist.dataset.weightRemaining = enemy.combatWeight();

		survivingStorage = warfleet.maxStorage();
		stufflist.statBlock.innerHTML = "";
		if(maxStorage < usedStorage) {
			stufflist.statBlock.innerHTML += "<b><font color=\"red\">Max Storage: " + beauty(maxStorage) + "</color></b>";
		} else {
			stufflist.statBlock.innerHTML += "Max Storage: " + beauty(maxStorage);
		}
		if(maxStorage < usedStorage || survivingStorage < usedStorage) {
			stufflist.statBlock.innerHTML += "<br><b><font color=\"red\">Used Storage: " + beauty(usedStorage) + "</color></b>";
		} else {
			stufflist.statBlock.innerHTML += "<br>Used Storage: " + beauty(usedStorage);
		}
		if(survivingStorage < usedStorage) {
			stufflist.statBlock.innerHTML += "<br><b><font color=\"red\">Surviving Storage: " + beauty(survivingStorage) + "</color></b>";
		} else {
			stufflist.statBlock.innerHTML += "<br>Surviving Storage: " + beauty(survivingStorage);
		}
			

		var warfleetRemainingNetWorth = warfleet.ships.reduce(function(arr, n, k) {
			if(n === 0) return arr;
			ships[k].cost.map(function(v, i) {
				arr[i] += n * v;
			})
			return arr;
		}, warfleet.storage.slice());
		resourcelosses.innerText = beautyObj(warfleetNetWorth.reduce(function(obj, v, i) {
			if(v === 0) return obj;
			var l = v - warfleetRemainingNetWorth[i];
			var resName = resources[i].name.capitalize();
			obj[resName] = beauty(l) + " (" + beauty(l / v * 100)+"%)";
			return obj;
		}, {}));

		var basePath = location.protocol+'//'+location.host+location.pathname;
		exporter.href = exporter.firstChild.alt = basePath+"#"+serialize(saveData);
		window.history.replaceState(saveData, document.title, window.location.hash ? exporter.href : window.location.pathname);
		localStorage.setItem("battlecalc-persist", JSON.stringify(saveData));

		nextrun.href = basePath+"#"+serialize({
			ships: warfleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
			bonuses: ["ammunition", "u-ammunition", "t-ammunition", "dark matter", "armor", "shield capsule", "engine", "exp", "enemy_exp"].reduce(function(obj, name) {
				var resource = resourcesName[name];
				if(name!="enemy_exp") {
					if(name!="exp") {
						var v = warfleet.storage[resource.id];
						if(v > 0) 
							saveData.bonuses[name] = v;
						else
							delete saveData.bonuses[name];
					}
					else {
						if(warfleet.combatWeight() > 0) 
							saveData.bonuses[name] = warfleet.exp;
						else
							delete saveData.bonuses[name];
					}
				}
				else
					delete saveData.bonuses[name];
				return saveData.bonuses;
			}, {}),
			enemySelected: enemypicker.selectedIndex + (enemy.combatWeight() ? 0 : 1),
			enemies: enemy.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
		});
		
		arr(document.getElementsByTagName("input")).map(function(input) {
			if(input.type == "text")
				addSeperatorsToInput(input)
			input.onchange = function() {
				lastChangedInput = input;
			}
		});
	};
	update();
	
});

function load_fleet (datano) {
	localStorage.setItem("battlecalc-persist", localStorage.getItem(battlecalc_save_name[datano]));
}

function save_fleet (datano) {
	localStorage.setItem(battlecalc_save_name[datano], localStorage.getItem("battlecalc-persist"));
}