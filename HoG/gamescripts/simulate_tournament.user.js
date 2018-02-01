// ==UserScript==
// @name         HoG Tools - Tournament Simulation
// @namespace    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts
// @version      1.0
// @description  Automatically enter Tournament Fleet in Battlecalc
// @author       GoDLloyD
// @match        https://game288398.konggames.com/gamez/0028/8398/live/*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	// Hook into game interface
	$("#icon_cont").append(function() {
		var simulate_tournament_button = $("<img>", {
			id: "simulate_tournament_button",
			height: 30,
			width: 30,
		}).css({
			position: "absolute",
			top: "90px",
			left: "44%",
			cursor: "pointer",
		}).click(function(e) {
		}).attr("title", "SIMULATE");
		return simulate_tournament_button;
	});
	var observer = new MutationObserver(function(mutation) {
		var base_style = {
			float: "left",
			margin: "0 2px",
			width: "1em",
			height: "1em",
			"text-align": "center",
			cursor: "pointer",
		};
		var active_style = {
			"background-color": "#80c0ff",
			"border-radius": "1em",
		};
		var inactive_style = {
			"background-color": "",
			"border-radius": "",
		};
	});
	var options = {
		childList: true,
		subtree: true,
	};
	observer.observe(document.getElementById("tournamentInterface"), options);
})();