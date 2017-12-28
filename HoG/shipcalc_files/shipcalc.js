shipcalc_save_name=['HoG_Shipcalc','HoG_Shipcalc1','HoG_Shipcalc2'];

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

	function serialize(obj) {
		return Object.keys(obj).map(function(k) {
			var v;
			if(typeof obj[k] === "object") {
				var section = obj[k];
				v = Object.keys(obj[k]).map(function(k) {
					return k+":"+section[k];
				}).join(",");
			} else {
				v = obj[k];
			}
			return k+"="+v;
		}).join("&");
	}
	function deserialize(str) {
		if(!str) return null;
		var data = str.split("&").map(function(str) {
			var parts = str.split("=", 2);
			if(parts[1] && parts[1].indexOf(":") != -1) {
				parts[1] = parts[1].split(",").map(function(str) {
					return str.split(":", 2);
				}).reduce(function(obj, add) {
					obj[add[0]] = add[1];
					return obj;
				}, {})
			}
			return parts;
		}).reduce(function(obj, add) {
			obj[add[0]] = add[1];
			return obj;
		}, {});
		if(data.resources) return data;
		return null;
	}
	function beautyObj(obj) {
		var a = [];
		for(var k in obj) {
			var v = obj[k];
			a.push(k + ": " + (typeof v === "number" ? beauty(v) : v));
		}
		return a.join("\n");
	}
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
			
			/*edits start*/
			["exp"].map(function(name) {
				var exp = fleet.exp;
				if(isNaN(exp)) exp = 0;
				else if(exp>MAX_FLEET_EXPERIENCE) exp = MAX_FLEET_EXPERIENCE;
				bonus.power += calcBonus[name](exp);
				bonus.armor += calcBonus[name](exp);
				bonus.hp += calcBonus[name](exp);
				bonus.shield += calcBonus[name](exp);
			});
			/*edits end*/
		}
		
		return bonus;
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
		var bonus = fleetBonus(fleet);
		var ship = ships[shipIndex];
		power += shipAmount * ship.power * bonus.power;
		piercepower += power * (ship.piercing || 0) / 100,
		armor += shipAmount * ship.armor * bonus.armor;
		hp += shipAmount * ship.hp * bonus.hp;
		var shiptough = ship.hp / (1 - dmgred(ship.armor * bonus.armor));
		var piercingbonus = Math.min(1 + 10 * (ship.piercing || 0) / 100, 10);
		toughness += shipAmount * shiptough;
		speedpower += (shipAmount+1) * ship.power * piercingbonus * bonus.power;
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
		label.title = "Power: " + ship.power;
		label.title += "\nPiercing: " + (ship.piercing || 0);
		label.title += "\nShield: " + ship.shield;
		label.title += "\nArmor: " + ship.armor;
		label.title += "\nHP: " + ship.hp;
		label.title += "\nSpeed: " + ship.speed;
		label.title += "\nWeight: " + ship.combatWeight;
		label.title += "\n\nRequirements:";
		label.title += "\nShipyard: " + ship.req;
		for(var requiredResearch in ship.resReq){
			label.title += "\n" + game.researches[researchesName[requiredResearch]].name + ": " + ship.resReq[requiredResearch];
		}
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.ship = ship;
		if(typeof n !== "undefined") input.value = n;
		input.showRank = span();
		//input.disabled = true;
		return div(label, input, input.showRank);
	}
	function resourceinput(resource, n) {
		var label = span(txt(resource.name.capitalize() + "/s"));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.resource = resource;
		if(typeof n !== "undefined") input.value = n;
		return div(label, input);
	}
	function inputval(input) {
		delete input.title;
		input.setCustomValidity("");

		var value = input.value;
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
			
		return parseInt(value) || 0;
	}

	var saveData;
	try {
		saveData = /*history.state || */deserialize(window.location.hash.substring(1)) || JSON.parse(localStorage.getItem("shipcalc-persist")) || {};
	} catch(e) {
		console.log(e);
		saveData = {};
	};
	window.history.replaceState(saveData, document.title, window.location.pathname);

	var resourcelist = document.getElementById("resourcelist");
	["iron", "steel", "titanium", "silicon", "technetium", "rhodium", "plastic", "circuit", "nanotubes", "ammunition", "robots", "armor", "engine", "full battery", "u-ammunition", "t-ammunition", "antimatter", "mK Embryo"].map(function(name) {
		var n;
		if(saveData.resources && saveData.resources[name]) n = saveData.resources[name];
		resourcelist.appendChild(resourceinput(resourcesName[name], n));
	});

	var stufflist = document.getElementById("stufflist");

	["ammunition", "u-ammunition", "t-ammunition", "armor", "engine","exp"].map(function(name) {
		var resource = resourcesName[name];
		var label = span(txt(name.capitalize()));
		var input = el("input");
		input.type = "text";
		input.label = label;
		input.name = name;
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.resource = resource;
		input.showValue = span();
		return div(label, input, input.showValue);
	}).map(appendTo(stufflist));
	["artofwar", "karan_artofwar"].map(function(name) {
		var research = researches[researchesName[name]];
		var label = span(txt(research.name));
		var input = el("input");
		input.type = "text";
		input.name = name;
		if(saveData.bonuses && saveData.bonuses[name]) input.value = saveData.bonuses[name];
		input.research = research;
		return div(label, input);
	}).map(appendTo(stufflist));
	["thoroid", "quris_value", "quris_honor"].map(function(name) {
		var artifact = artifacts[artifactsName[name]];
		var label = span(txt(artifact.name));
		var input = el("input");
		input.type = "checkbox";
		input.name = name;
		input.value = artifact.description;
		if(saveData.bonuses && saveData.bonuses[name]) input.checked = saveData.bonuses[name];
		input.artifact = artifact;
		return div(label, input);
	}).map(appendTo(stufflist));
	
	var calcBonus = {
		"ammunition": function(v) { return 10 * Math.log(1 + v / 1E7)/Math.log(2); },
		"u-ammunition": function(v) { return 20 * Math.log(1 + v / 1E7)/Math.log(2); },
		"t-ammunition": function(v) { return 60 * Math.log(1 + v / 2E7)/Math.log(2); },
		"armor": function(v) { return v / 2e6; },
		"engine": function(v) { return v / 5e6; },
		"exp": function(v) { return v/2000;},
		"enemy_exp": function(v) { return v/2000;},
	};

	var shipIndexList = [];
	var shiplist = document.getElementById("shiplist");
	shiplist.appendChild(div(span(txt("Shiptype")), span(txt("Ships/day")), span(txt("Rank"))))
	game.ships.map(function(ship) {
		var n;
		if(ship.type === "Colonial Ship" || ship.type === "Cargoship") return;
		//if(ship.name === "Koroleva" || ship.name === "Augustus" || ship.name === "Leonidas" || ship.name === "Alexander" || ship.name === "Cerberus" || ship.name === "Charon") return;
		shiplist.appendChild(shipinput(ship, n));
		shipIndexList.push(ship.id);
	});

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
		
		/*edit start*/
		var exp = parseInt(document.getElementsByName("exp")[0].value);
		if(isNaN(exp)) exp = 0;
 		warfleet.exp = exp;
		/*edit end*/
		
		arr(resourcelist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) saveData.resources[input.resource.name] = val;
		});
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.resource) {
				warfleet.storage[input.resource.id] = val;
				input.showValue.innerText = "+"+beauty(calcBonus[input.resource.name](warfleet.storage[input.resource.id])) + "x";
			} else if(input.research) {
				var newLevel = val;
				while(input.research.level > newLevel) { input.research.level--; input.research.unbonus(); }
				while(input.research.level < newLevel) { input.research.level++; input.research.bonus(); }
			} else if(input.artifact) {
				var newLevel = val;
				while(input.artifact.possessed > newLevel) { input.artifact.possessed--; input.artifact.unaction(); }
				while(input.artifact.possessed < newLevel) { input.artifact.possessed++; input.artifact.action(); }
			} else {
				var exp = parseInt(document.getElementsByName("exp")[0].value);
				warfleet.exp = exp;
			}
			if(val > 0) saveData.bonuses[input.name] = val;
		});
		
		arr(shiplist.getElementsByTagName("input")).map(function(input) {
			var affordableShipsAmount = [];
			ships[input.ship.id].cost.map(function(resourceCost, resourceIndex) {
				if(!resourceCost) return;
				var availableResourcesPerDay = saveData.resources[resources[resourceIndex].name] * 60 * 60 * 24 || 0;
				affordableShipsAmount.push(Math.round(availableResourcesPerDay / resourceCost * 100) / 100);
			});
			affordableShipsAmount.sort(function(a, b) {
				return a - b;
			});
			warfleet.ships[input.ship.id] = affordableShipsAmount[0] || 0;
			input.value = beauty(affordableShipsAmount[0]) || 0;//warfleet.ships[input.ship.id];
		});
		shipIndexList.sort(function(shipIndex2, shipIndex1) {
			return shipStats(warfleet, shipIndex1, warfleet.ships[shipIndex1]).Value - shipStats(warfleet, shipIndex2, warfleet.ships[shipIndex2]).Value;
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

function load_fleet (datano) {
	localStorage.setItem("shipcalc-persist", localStorage.getItem(shipcalc_save_name[datano]));
}

function save_fleet (datano) {
	localStorage.setItem(shipcalc_save_name[datano], localStorage.getItem("shipcalc-persist"));
}
