// ==UserScript==
// @name         HoG Tools - Tournament Simulation
// @namespace    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts
// @version      1.4
// @description  Adds a link to the battle calculator to the Tournament
// @author       GoDLloyD
// @match        https://game288398.konggames.com/gamez/0028/8398/live/*
// @grant        none
// @downloadURL  https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/simulate_tournament.user.js
// @updateURL    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/simulate_tournament.user.js
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
			var fleetIndex=$("#orbit_fleet_list").val();
			if(document.getElementById("tournament_battlecalc_button")) {
				if(!planets[tournamentPlanet].fleets[fleetIndex]) 
					$("#tournament_battlecalc_button").hide();
				else
					$("#tournament_battlecalc_button").show();
				return;
			} 
			if(!planets[tournamentPlanet].fleets[fleetIndex]) return;
			var fleet = planets[tournamentPlanet].fleets[fleetIndex];
			var enemyFleet = qurisTournament.fleet;

			var calcData = {
				ships: fleet.ships.reduce(function(obj, v, k) { if(v > 0) obj[k] = v; return obj; }, {}),
				bonuses: ["thoroid", "quris_value", "quris_honor", "quris_glory"].reduce(function(obj, name) {
					var artifact = artifacts[artifactsName[name]];
					if(artifact.possessed)
						obj[name] = 1;
					else
						obj[name] = 0;
					return obj;
				}, ["artofwar", "karan_artofwar", "protohalean_science", "mk_tech"].reduce(function(obj, name) {
					var research = researches[researchesName[name]];
					if(!research.requirement()) return obj;
					obj[name] = research.level;
					return obj;
				}, ["ammunition", "u-ammunition", "t-ammunition", "dark matter", "armor", "engine", "exp", "enemy_exp"].reduce(function(obj, name) {
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
			var attackButton = document.getElementById("fight_button");
			if(!attackButton) return;
			var calcButton = document.createElement(attackButton.tagName);
			calcButton.id = "tournament_battlecalc_button";
			calcButton.className = attackButton.className;
			calcButton.style.position = "absolute";
			calcButton.style.top = "88px";
			calcButton.style.left = "44%";
			var a = document.createElement("a");
			a.innerText = "Calculate Battle";
			a.style.color = "blue";
			a.className = attackButton.firstChild.className;
			a.href = url;
			a.target = "battlecalc";
			calcButton.appendChild(a);
			attackButton.parentNode.appendChild(calcButton);
		});
		var options = {
			childList: true,
			subtree: true,
		};
		observer.observe(document.getElementById("profile_interface"), options);
	})();
};

loadScript("https://godlloyd.github.io/HeartOfGalaxy/HoG/common/common.js", userScript);