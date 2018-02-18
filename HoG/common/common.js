function arr(v) { return Array.prototype.slice.call(v); }
function appendTo(a) { return function(b) { return a.appendChild(b); }; }
function el(tag, contents) { var el = document.createElement(tag); if(contents) contents.map(appendTo(el)); return el; }
function txt() { return document.createTextNode(arr(arguments).join()); }
function div() { return el("div", arr(arguments)); }
function span() { return el("span", arr(arguments)); }
function label() { return el("label", arr(arguments)); }

function importSave() {
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
			}
			else document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Corrupted data</span>")
		} catch(qa){
			console.log(qa.message),document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Error</span>")
		}
	else document.getElementById("impsave")&&(document.getElementById("impsave").innerHTML="Import Save: <span class='red_text'>Invalid data</span>")
};