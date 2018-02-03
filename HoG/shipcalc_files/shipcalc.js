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
		if(value)
			input.value = value;
			
		return parseInt(value) || 0;
	}
	function createImport() {
		var input = el("input");
		input.type = "text";
		input.value = "paste savefile here"
		input.setAttribute("id", "saveimport");
		input.onclick = function(){
			input.setSelectionRange(0, input.value.length);
		}
		
		var galaxyChooser = el("select");
		var resourcesOption = el("option");
		resourcesOption.value = -1;
		resourcesOption.innerText = "Select a galaxy";
		var totalOption = el("option");
		totalOption.value = "all";
		totalOption.innerText = "All Galaxies";
		galaxyChooser.appendChild(resourcesOption);
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
		
		document.getElementById("importlist").appendChild(input);
		document.getElementById("importlist").appendChild(div(galaxyChooser, importButton));
		
		document.getElementById("impsave").onclick = function(){
			var d=document.getElementById("saveimport").value;
			d=d.split("@")[0];
			var g;
			(g="hg"==d.substring(0,2)?decodeURIComponent(LZString.decompressFromUTF16(LZString.decompressFromBase64(d.substring(2)))):LZString.decompressFromUTF16(LZString.decompressFromBase64(d)))||(g="hg"==d.substring(0,2)?decodeURIComponent(LZString.decompressFromUTF16(atob(d.substring(2)))):LZString.decompressFromUTF16(atob(d)));
			if(g)
				try {
					var h=g.split("@DIVIDER@");
					console.log(h[2]);
					if(3<=h.length){
						for(d=0;d<game.researches.length;d++)
							for(var l=game.researches[d].level,m=0;	m<l;m++)
								game.researches[d].unbonus(),
								game.researches[d].level--;
						firstTime=!1;
						var w=JSON.parse(h[1]),n=JSON.parse(h[0]),t=JSON.parse(h[2]);
						console.log("iMPORT");
						clearTimeout(idleTimeout);
						idleBon=1;
						for(d=0;d<w.length;d++)
							civisLoader(civis[d],w[d],civis[d].name);
						fleetSchedule.count=t.count;
						m=0;
						for(var v in t.fleets)
							m++;
						console.log(m);
						console.log(t.fleets);
						fleetSchedule.load(t.schedule,t.fleets,m);
						t.m&&market.load(t.m);
						t.st&&settingsLoader(t.st);
						t.qur&&(t.qur.points&&(qurisTournament.points=t.qur.points||0),t.qur.lose&&(qurisTournament.lose=t.qur.lose||0));
						if(t.art)
							for(var y in t.art)
								artifacts[artifactsName[y]].collect();
						if(t.qst)
							for(var x in t.qst)
								quests[questNames[x]].done=!0;
						if(t.plc)
							for(x in t.plc)
								places[placesNames[x]].done=!0;
						if(t.tuts)
							for(x in t.tuts)
								tutorials[tutorialsNames[x]].done=!0;
						game=civis[gameSettings.civis];
						for(d=0;d<n.length;d++)
							n[d]&&planetLoader(planets[d],n[d]);
						game.searchPlanet(planetsName.virgo)||(planets[planetsName.virgo].setCivis(8),civis[8].capital=planetsName.virgo);
						game.searchPlanet(planetsName.nassaus)||
							(planets[planetsName.nassaus].setCivis(7),civis[7].capital=planetsName.nassaus);
							
						var savefileCivilizations=w,savefilePlanets=n,savefileExtras=t;
						["iron", "steel", "titanium", "silicon", "technetium", "rhodium", "plastic", "circuit", "nanotubes", "ammunition", "robots", "armor", "engine", "full battery", "u-ammunition", "t-ammunition", "antimatter", "mK Embryo"].map(function(name) {
							var resource = resourcesName[name];
							var b = resource.id
							for(var e=52,g=Array(game.buildings.length),h=0;h<game.buildings.length;h++)
								g[h]=0;
							for(var l=0;l<game.planets.length;l++)
								if(galaxyChooser.value == "all" || galaxyChooser.value == planets[l].map)
									for(h=0;h<game.buildings.length;h++)
										0!=game.buildings[h].resourcesProd[b]&&(g[h]+=planets[game.planets[l]].structure[h].number);
							var m=0;
							for(h=0;h<game.buildings.length;h++)
								if(0<g[h]){
									e+=20;
									for(l=0;l<game.planets.length;l++)
										if(galaxyChooser.value == "all" || galaxyChooser.value == planets[l].map)
											m+=game.buildings[h].production(planets[game.planets[l]])[b];
								}
							document.getElementById("resource_" + resource.id).value = Math.floor(m*100)/100;
						});
						["artofwar", "karan_artofwar"].map(function(name) {
							var research = researches[researchesName[name]];
							document.getElementById("research_" + research.id).value = game.researches[researchesName[name]].level;
						});
						["thoroid", "quris_value", "quris_honor", "quris_glory"].map(function(name) {
							var artifact = artifacts[artifactsName[name]];
							document.getElementById("artifact_" + artifact.id).checked = artifacts[artifactsName[name]].possessed;
						});
					}
					else document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Corrupted data</span>")
				} catch(qa){
					console.log(qa.message),document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Error</span>")
				}
			else document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Invalid data</span>")
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

	var resourcelist = document.getElementById("resourcelist");
	["iron", "steel", "titanium", "silicon", "technetium", "rhodium", "plastic", "circuit", "nanotubes", "ammunition", "robots", "armor", "engine", "full battery", "u-ammunition", "t-ammunition", "antimatter", "mK Embryo"].map(function(name) {
		var n;
		if(saveData.resources && saveData.resources[name]) n = saveData.resources[name];
		resourcelist.appendChild(resourceinput(resourcesName[name], n));
	});

	var stufflist = document.getElementById("stufflist");

	["artofwar", "karan_artofwar"].map(function(name) {
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
	["thoroid", "quris_value", "quris_honor", "quris_glory"].map(function(name) {
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

	var shipIndexList = [];
	var shiplist = document.getElementById("shiplist");
	shiplist.appendChild(div(span(txt("Shiptype")), span(txt("Ships/day")), span(txt("Rank")), span(txt("Limit"))));
	game.ships.map(function(ship) {
		var n;
		if(ship.type === "Colonial Ship" || ship.type === "Cargoship") return;
		if(ship.name === "Koroleva" || ship.name === "Augustus" || ship.name === "Leonidas" || ship.name === "Alexander" || ship.name === "Cerberus" || ship.name === "Charon") return;
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
		
		arr(resourcelist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(val > 0) saveData.resources[input.resource.name] = val;
		});
		arr(stufflist.getElementsByTagName("input")).map(function(input) {
			var val = inputval(input);
			if(input.research) {
				var newLevel = val;
				while(input.research.level > newLevel) { input.research.level--; input.research.unbonus(); }
				while(input.research.level < newLevel) { input.research.level++; input.research.bonus(); }
			} else if(input.artifact) {
				var newLevel = val;
				while(input.artifact.possessed > newLevel) { input.artifact.possessed--; input.artifact.unaction(); }
				while(input.artifact.possessed < newLevel) { input.artifact.possessed++; input.artifact.action(); }
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
				var availableResourcesPerDay = saveData.resources[resources[resourceIndex].name] * 60 * 60 * 24 || 0;
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
