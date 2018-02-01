// ==UserScript==
// @name         HoG Tools - Planet Attack Simulation
// @namespace    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts
// @version      1.0
// @description  Adds a link to the battle calculator on each player fleet near an enemy fleet
// @author       GoDLloyD
// @match        https://game288398.konggames.com/gamez/0028/8398/live/*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

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

	var observer = new MutationObserver(function(mutation) {
		if(document.getElementById("battlecalc_button")) return;
		if(typeof currentFleetId === "undefined") return;
		var parts = currentFleetId.split("_");
		var planet = planets[parts[0]];
		var fleet = planet.fleets[parts[1]];
		var enemyFleetId = Object.keys(planet.fleets).filter(function(k) {
			var fleet = planet.fleets[k];
			return fleet.weight() && fleet.civis != game.id;
		})[0];
		var enemyFleet = planet.fleets[enemyFleetId];
		if(!fleet || !enemyFleet || fleet.civis != game.id) return;

		var calcData = {
			ships: fleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
			bonuses: ["thoroid", "quris_value", "quris_honor", "quris_glory"].reduce(function(obj, name) {
				var artifact = artifacts[artifactsName[name]];
				if(artifact.possessed)
					obj[name] = 1;
				else
					obj[name] = 0;
				return obj;
			}, ["artofwar", "karan_artofwar"].reduce(function(obj, name) {
				var research = researches[researchesName[name]];
				if(!research.requirement()) return obj;
				obj[name] = research.level;
				return obj;
			}, ["ammunition", "u-ammunition", "t-ammunition", "armor", "engine", "exp", "enemy_exp"].reduce(function(obj, name) {
				var resource = resourcesName[name];
				if(name!="enemy_exp") {
					if(name!="exp") {
						var v = fleet.storage[resource.id];
						if(v > 0) 
							obj[name] = v;
					}
					else {
						obj[name] = fleet.exp;
					}
				}
				return obj;
			}, {}))),
			enemySelected: "free_battle_" + enemyFleet.civis,
			enemies: enemyFleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
		};
		var url = "https://godlloyd.github.io/HeartOfGalaxy/HoG/Battlecalc.html#"+serialize(calcData);
		var attackButton = document.getElementById("attack_button");
		if(!attackButton) return;
		var calcButton = document.createElement(attackButton.tagName);
		calcButton.id = "battlecalc_button";
		calcButton.className = attackButton.className;
		var a = document.createElement("a");
		a.innerText = "Calculate Attack";
		a.className = attackButton.firstChild.className;
		a.href = url;
		a.target = "battlecalc";
		calcButton.appendChild(a);
		attackButton.parentNode.insertBefore(calcButton, attackButton.nextSibling);
	});
	var options = {
		childList: true,
		subtree: true,
	};
	observer.observe(document.getElementById("ship_info"), options);
})();