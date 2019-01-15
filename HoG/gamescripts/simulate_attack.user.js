// ==UserScript==
// @name         HoG Tools - Planet Attack Simulation
// @namespace    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts
// @version      1.6
// @description  Adds a link to the battle calculator on each player fleet near an enemy fleet
// @author       GoDLloyD
// @match        https://game288398.konggames.com/gamez/0028/8398/live/*
// @grant        none
// @downloadURL  https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/simulate_attack.user.js
// @updateURL    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/simulate_attack.user.js
// ==/UserScript==

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

var userScript = function() {
	(function() {
		'use strict';

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
			if(!fleet || fleet.civis != game.id) return;
			var varEnemySelected = "";
			var varEnemies = "";
			if(!enemyFleet) {
				varEnemySelected = "free_battle" + "_" + civis.length;
			} else {
				varEnemySelected = planet.id + "_" + enemyFleetId;
				varEnemies = enemyFleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {});
			}

			var calcData = {
				ships: fleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
				bonuses: ["quris_value", "quris_honor", "quris_glory", "thoroid", "scepter"].reduce(function(obj, name) {
					var artifact = artifacts[artifactsName[name]];
					if(artifact.possessed)
						obj[name] = 1;
					else
						obj[name] = 0;
					return obj;
				}, ["artofwar", "karan_artofwar", "protohalean_science"].reduce(function(obj, name) {
					var research = researches[researchesName[name]];
					if(!research.requirement()) return obj;
					obj[name] = research.level;
					return obj;
				}, ["ammunition", "u-ammunition", "t-ammunition", "dark matter", "armor", "shield capsule", "engine", "exp", "enemy_exp"].reduce(function(obj, name) {
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
				enemySelected: varEnemySelected,
				enemies: varEnemies,
			};
			var url = "https://godlloyd.github.io/HeartOfGalaxy/HoG/Battlecalc.html" + "#nobitly" + "#"+serialize(calcData);
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
};

loadScript("https://godlloyd.github.io/HeartOfGalaxy/HoG/common/common.js", userScript);