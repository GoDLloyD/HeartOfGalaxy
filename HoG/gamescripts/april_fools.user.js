// ==UserScript==
// @name         HoG Tools - April Fools
// @namespace    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts
// @version      1.1
// @description  Changes the name of "Anger of Perseus" to "Doom Snail"
// @author       GoDLloyD
// @match        https://game288398.konggames.com/gamez/0028/8398/live/*
// @match        https://godlloyd.github.io/HeartOfGalaxy/*
// @grant        none
// @downloadURL  https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/april_fools.user.js
// @updateURL    https://github.com/GoDLloyD/HeartOfGalaxy/HoG/gamescripts/april_fools.user.js
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
	aprilFoolize();
};


loadScript("https://godlloyd.github.io/HeartOfGalaxy/HoG/common/common.js", userScript);