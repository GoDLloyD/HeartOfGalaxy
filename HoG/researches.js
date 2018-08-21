function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
var cookie=[];
function getCookie() {
	var ac=document.cookie.split(';');
	ac.forEach(function(value,index){
		var c=value.split('=');
		cookie[c[0]]=c[1];
	});
}
function get_rect(obj) {
	var r=obj.getBoundingClientRect();
	return {
			'left':r.left+window.pageXOffset,
			'top':r.top+window.pageYOffset,
			'width':r.width,
			'height':r.height
	};
}

function select_alltext (obj) {
	obj.select();
}


var scale={
	0:{'scale':''  ,'comparision':''  ,'multi':1},
	1:{'scale':'K' ,'comparision':'K' ,'multi':1000},
	2:{'scale':'M' ,'comparision':'M' ,'multi':1000000},
	3:{'scale':'B' ,'comparision':'B' ,'multi':1000000000},
	4:{'scale':'T' ,'comparision':'T' ,'multi':1000000000000},
	5:{'scale':'Qa','comparision':'QA','multi':1000000000000000},
	6:{'scale':'Qi','comparision':'QI','multi':1000000000000000000},
	7:{'scale':'Sx','comparision':'SX','multi':1000000000000000000000},
};
scale.length=Object.keys(scale).length;
function add_scale(num,rounddown) {
	var p;
	var rd;
	var ret;
	
	for (p=scale.length-1; p>0; p--) {
		if (num>=scale[p].multi) {
			break;
		}
	}
	if (rounddown===void 0) {
		rd=2;
	} else {
		rd=parseInt(rounddown);
		if (rd!==rd) rd=0;
	}
	return (num/scale[p].multi).toFixed(rd)+scale[p].scale;
}
function parse_scale (num) {
	var cs;
	var pre;
	
	num=(num+'').trim();
	//	''
	if (num==='') return '';
	//	null, NaN, Undefined are error
	if (num===null || !(num===num) || (num===void 0)) return NaN;
	for (cs=scale.length-1; cs>0; cs--) {
		if (((num.slice(-scale[cs].comparision.length)).toUpperCase())==scale[cs].comparision) {
			break;
		}
	}
	pre=Number(num.slice(0,num.length-scale[cs].comparision.length));
	if (!(pre===pre)) return NaN;	//	isNaN
	return pre*scale[cs].multi;
}


var INFLUENCE_DEFAULT=1878;
var TP_LIMIT_DEFAULT='';
var researchcalc_ng_id={22:true,27:true};

var total_points=[0,0];
var research_data={};
research_data.research=[];
research_data.influence=INFLUENCE_DEFAULT;
research_data.left_rp=0;
research_data.tp_limit=TP_LIMIT_DEFAULT;
research_data.tp_limit_value=TP_LIMIT_DEFAULT;
var tp_left;
researchcalc_save_name=['HoG_Researchcalc','HoG_Researchcalc1','HoG_Researchcalc2'];
function str_research (lv,sum,ini,mul) {
	this.lv=lv;
	this.sum=sum;
	this.ini=ini;
	this.next=ini;
	this.mul=mul;
}
var button_repeat_timer;
var button_repeat_phase=0;
var button_repeat_interval=180;
var button_repeat_startdelay=500;

function show_earning_tps () {
	var lrv;
	research_data.influence=parseInt(document.getElementById('influence').value);
	research_data.left_rp=document.getElementById('left_rp').value;
	lrv=parse_scale(research_data.left_rp);
	if (lrv==='') lrv=0;
	document.getElementById('left_rp_value').innerHTML='('+lrv+')';
	var tp=Math.floor(2*research_data.influence*Math.log(1+(lrv+total_points[0])/200000000000)/Math.log(5));
	document.getElementById('earning_technology_points').innerHTML=beauty(tp)+' ('+tp+')';
	return;
}

function get_cell_name_id(research_id) {
	var p=researches[research_id].pos;
	return 'researchname#'+p[0]+','+p[1];
}
function get_cell_level_id(research_id) {
	var p=researches[research_id].pos;
	return 'researchlevel#'+p[0]+','+p[1];
}
function get_input_level_id (id,type) {
	return 'input_lv'+type+'@'+id;
}
function get_total_points_id(type) {
	return 'total_points'+type;
}
function get_next_point_id(id,type) {
	return 'cell_next'+type+'@'+id;
}


function show_researchcalc () {
	var cr;
	var tsize=[];
	var r,rd;
	var dc;
	var d;
	var idc,idh;
	
	document.getElementById('influence').value=INFLUENCE_DEFAULT;
	document.getElementById('tp_limit').value=TP_LIMIT_DEFAULT;
	
	event_onkeypress_influence();
	
	create_researches_table();
	
	for (cr=0; cr<researches.length; cr++) {
		if (researches[cr].id==="placeholder") continue;
		if (research_data.research[cr]===void 0) continue;
		r=researches[cr];
		rd=research_data.research[cr];
		
		//	name of research
		d=document.getElementById(get_cell_name_id(cr));
		d.innerHTML=r.name;
		d.className='center nolinebottom name';
		//	level with research points and up/down buttons
		dc='<div class="table width100pc"><div class="row">';
		//		down RP level button
		dc+='<div class="cell textleft"><span class="textbutton fontlarge" onmousedown="javascript:research_level_mousedown('+cr+',0,0);" onmouseup="javascript:research_level_mouseup('+cr+',0,0);" onmouseout="javascript:research_level_mouseup('+cr+',0,0);">\u25C0</span></div>';
		//		level input
		dc+='<div class="cellnospace"> Lv <input type="text" class="tinyint" id="input_lv0@'+cr+'" value="'+rd[0].lv+'" onchange="javascript:change_level('+cr+',0,this);" onfocus="javascript:select_alltext(this);"> w/ RP</div>';
		//		up RP level button
		dc+='<div class="cell textright"><span class="textbutton fontlarge" onmousedown="javascript:research_level_mousedown('+cr+',0,1);" onmouseup="javascript:research_level_mouseup('+cr+',0,1);" onmouseout="javascript:research_level_mouseup('+cr+',0,1);">\u25B6</span></div>';
		dc+='</div></div>';
		//	next research points and multiplier
		dc+='<div class="fontsmall" id="'+get_next_point_id(cr,0)+'">next <span class="info">'+beauty(rd[0].next)+'</span> (x'+rd[0].mul+')</div>';
		//	level with technology points and up/down buttons
		dc+='<div class="table width100pc"><div class="row">';
		//		down TP level button
		dc+='<div class="cell textleft"><span class="textbutton fontlarge" onmousedown="javascript:research_level_mousedown('+cr+',1,0);" onmouseup="javascript:research_level_mouseup('+cr+',1,0);" onmouseout="javascript:research_level_mouseup('+cr+',1,0);">\u25C0</span></div>';
		//		level input
		dc+='<div class="cellnospace col_tp"> Lv <input type="text" class="tinyint" id="input_lv1@'+cr+'" value="'+rd[0].lv+'" onchange="javascript:change_level('+cr+',1,this);" onfocus="javascript:select_alltext(this);"> w/ TP</div>';
		//		up TP level button
		dc+='<div class="cell textright"><span class="textbutton fontlarge" onmousedown="javascript:research_level_mousedown('+cr+',1,1);" onmouseup="javascript:research_level_mouseup('+cr+',1,1);" onmouseout="javascript:research_level_mouseup('+cr+',1,1);">\u25B6</span></div>';
		dc+='</div></div>';
		//	next technology points and multiplier
		dc+='<div class="fontsmall" id="'+get_next_point_id(cr,1)+'">next <span class="info">'+beauty(rd[1].next)+'</span> (x'+rd[1].mul+')</div>';
		d=document.getElementById(get_cell_level_id(cr));
		d.innerHTML=dc;
		d.className='center nolinetop';
		//	set onkeypress event (must be called this after element is set)
		event_onkeypress_level(cr,0);
	}
	
	show_earning_tps();
}

function create_researches_table () {
	var cr;
	var p;
	var mx=0,my=0;
	var x,y;
	var dh,dl;
	var rd,r;
	var ret='';

	for (cr=0; cr<researches.length; cr++) {
		if (researches[cr].id==="placeholder") continue;
		p=researches[cr].pos;
		if (p===void 0) continue;
		if (researchcalc_ng_id[cr]) continue;
		//	fix table size
		if (mx<p[0]) mx=p[0];
		if (my<p[1]) my=p[1];
		//	set varuables
		research_data.research[cr]=[];
		r=researches[cr];
		rd=research_data.research[cr];
		rd[0]=new str_research(0,0,r.researchPoint,r.mult);
		rd[1]=new str_research(0,0,r.techPoint,r.multBonus);
	}
	
	ret+='<tbody>';
	for(y=0; y<=my; y++) {
		dh='<tr class="textcenter texttop">';
		dl='<tr class="textcenter textbottom">';
		for(x=0; x<=mx; x++) {
			dh+='<td class="noline" id="researchname#'+x+','+y+'" style="width: 180px;"></td>';
			dl+='<td class="noline" id="researchlevel#'+x+','+y+'" style="width: 180px;"></td>';
		}
		dh+='</tr>';
		dl+='</tr>';
		ret+=(dh+dl);
	}
	ret+='</tbody>';
	
	document.getElementById('researches_list').innerHTML=ret;
	return;
}

function research_lvup (id,type) {
	var rd=research_data.research[id][type];
	var r=researches[id];
	
	if (rd.lv==researches[id].max) return;
	
	rd.sum+=rd.next;
	total_points[type]+=(rd.ini*Math.pow(rd.mul,rd.lv));
	rd.lv++;
	rd.next=rd.ini*Math.pow(rd.mul,rd.lv)
	
	show_level(id,type);
	show_next_point(id,type);
	show_total_points(type);
	//	earning TP
	if (type==0) show_earning_tps();
	
	return;
}


function research_lvdown (id,type) {
	var rd=research_data.research[id][type];
	var r=researches[id];
	var l;
	var cr;
	
	if (rd.lv==0) return;
	
	rd.lv--;
	set_level(id,type,rd.lv);
	
	return;
}

function research_level_mousedown (id,type,lvup) {
	var phase2=function(){
		lvup?research_lvup(id,type):research_lvdown(id,type);
	}
	var phase1=function(){
		clearTimeout(button_repeat_timer);
		lvup?research_lvup(id,type):research_lvdown(id,type);
		button_repeat_phase=2;
		button_repeat_timer=setTimeout(phase1,button_repeat_interval);
	}
	button_repeat_timer=setTimeout(phase1,button_repeat_startdelay);
	button_repeat_phase=1;
}

function research_level_mouseup (id,type,lvup) {
	switch (button_repeat_phase) {
	case 0:
		break;
	case 1:
		clearTimeout(button_repeat_timer);
		lvup?research_lvup(id,type):research_lvdown(id,type);
		break;
	case 2:
		clearTimeout(button_repeat_timer);
		break;
	default:
	}
	button_repeat_phase=0;
}

function event_onkeypress_influence () {
	document.getElementById('influence').onkeydown=function (event) {
		//	only 'Enter' key
		if (event.keyCode!=13) return;
		show_earning_tps();
	};
}

function event_onkeypress_level (id,type) {
	var il=document.getElementById(get_input_level_id(id,type));
	il.onkeypress=function (event) {
		//	only 'Enter' key
		if (event.keyCode!=13) return;
		set_level(id,type,parseInt(il.value));
	}
}
function change_level (id,type,obj) {
	var l=parseInt(obj.value);
	//	if not changed, exit
	if (l==research_data.research[id][type].lv) {
		obj.value=l;
		return;
	}
	set_level(id,type,l);
}
function set_level (id,type,level) {
	var rd=research_data.research[id][type];
	var r=researches[id];
	var l;
	var cr;
	
	level=parseInt(level);
	if (level<=0) {
		//	under level min
		rd.lv=0;
	} else {
		if (level<=100 && level<=researches[id].max) {
			rd.lv=level;
		} else {
			if (researches[id].max<100 && researches[id].max<level) {
				rd.lv=researches[id].max;
			} else {
				rd.lv=100;
			}
		}
	}
	rd.sum=0;
	//	re-sum points of this research
	for (l=0; l<rd.lv; l++) {
		rd.sum+=rd.ini*Math.pow(rd.mul,l);
	}
	rd.next=rd.ini*Math.pow(rd.mul,rd.lv);
	//	re-sum total points
	total_points[type]=0;
	for (cr=0; cr<researches.length; cr++) {
		if (researches[cr].id==="placeholder") continue;
		if (researches[cr].pos === void 0) continue;
		if (researchcalc_ng_id[cr]) continue;
		total_points[type]+=research_data.research[cr][type].sum;
	}
	
	show_level(id,type);
	show_next_point(id,type);
		'next <span class="info">'+beauty(rd.next)+'</span> (x'+rd.mul+')';
	show_total_points(type);
	//	earning TP
	if (type==0) show_earning_tps();
	
	return;
}

function show_level (id,type) {
	var d=document.getElementById('input_lv'+type+'@'+id);
	if (d===null||d===void 0) return;
	d.value=research_data.research[id][type].lv;
}
function show_next_point (id,type) {
	var rd;
	var d=document.getElementById(get_next_point_id(id,type));
	
	if (d===null||d===void 0) return;
	rd=research_data.research[id][type];
	if (rd.lv>=researches[id].max) {
		d.innerHTML='<span class="attention">Max Level Reached!</span>';
	} else {
		if (type==1 && research_data.tp_limit_value!=='' && research_data.tp_limit_value===research_data.tp_limit_value && rd.next>tp_left) {
			d.innerHTML='<span class="color_red">next '+beauty(rd.next)+' (x'+rd.mul+')</span>';
		} else {
			d.innerHTML='next <span class="info">'+beauty(rd.next)+'</span> (x'+rd.mul+')';
		}
	}
}
function show_total_points (type) {
	var p=document.getElementById(get_total_points_id(type));
	var lt;
	p.innerHTML=beauty(total_points[type])+' ('+total_points[type]+')';
	
	if (type==1) {
		lt=document.getElementById('left_tp');
		if (research_data.tp_limit_value==='' || 
				!(research_data.tp_limit_value===research_data.tp_limit_value)) {
			//	TP limit is error or not inputed.
			lt.innerHTML='';
		} else {
			tp_left=research_data.tp_limit_value-total_points[type];
			lt.innerHTML=beauty(tp_left)+' ('+tp_left+')';
			if (tp_left<0) {
				lt.className='color_red';
			} else {
				lt.className='info';
			}
		}
		research_data.research.forEach(function (elm,idx) {
			show_next_point(idx,1);
		});
	}
	return;
}


function change_tp_limit (obj) {
	set_tp_limit(obj.value);
	show_total_points(1);
}

function set_tp_limit(limit) {
	var v=document.getElementById('tp_limit_value');
	research_data.tp_limit=limit;
	research_data.tp_limit_value=parse_scale(limit);
	if (!(research_data.tp_limit_value===research_data.tp_limit_value)) {
		//	is NaN
		v.innerHTML='Error!';
		v.className='color_error';
	} else if (research_data.tp_limit_value==='') {
		v.innerHTML='';
	} else {
		v.innerHTML='('+research_data.tp_limit_value+')';
		v.className='info';
	}
}

function reset_research () {
	var r;
	
	research_data.research.forEach(function(value,index){
		if (value===null) return;
		value[0].lv=0;
		value[0].sum=0;
		value[0].next=value[0].ini;
		value[1].lv=0;
		value[1].sum=0;
		value[1].next=value[1].ini;
		show_level(index,0);
		show_level(index,1);
		show_next_point(index,0);
		show_next_point(index,1);
	});
	total_points=[0,0];
	show_total_points(0);
	show_total_points(1);
	show_earning_tps();
}

function load_research (datano) {
	var sd=localStorage.getItem(researchcalc_save_name[datano]);
	
	if (sd===null||sd===void 0) return;
	research_data=JSON.parse(sd);
	
	//	limit tp
	if (research_data.tp_limit===void 0) research_data.tp_limit='';
	document.getElementById('tp_limit').value=research_data.tp_limit;
	set_tp_limit(research_data.tp_limit);
	//	influence
	document.getElementById('influence').value=research_data.influence;
	//	researches
	total_points=[0,0];
	research_data.research.forEach(function(value,index) {
		if(value===null) return;
		total_points[0]+=value[0].sum;
		total_points[1]+=value[1].sum;
		//	display level
		show_level(index,0);
		show_level(index,1);
		//	display next point
		show_next_point(index,0);
		show_next_point(index,1);
	});
	show_total_points(0);
	show_total_points(1);
	show_earning_tps();
}

function save_research (datano) {
	localStorage.setItem(researchcalc_save_name[datano],JSON.stringify(research_data));
}



