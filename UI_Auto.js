// ==UserScript==
// @name         WF Auto Pilot
// @namespace    http://tampermonkey.net/
// @version      2025-05-24.002
// @description  try to take over the world!
// @author       BrolyTheVVF
// @match        https://*.wonderland-fantasy.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wonderland-fantasy.com
// @grant        none
// ==/UserScript==

(function() {
function ___autoInit(){
if(!game || !game.player){
	setTimeout(() => {
		___autoInit();
	},1000);
	return;
}

game.auto = {};
game.auto.__isBuild = false;
game.auto.HTML = false;
game.auto.current = {
	"map": false,
	"npcList": {},
	"attackElite": true,
	"attackChief": true,
	"active": false,
	"state": "idle",
	"tickDelay": 0,
	
	//Change the way ignored NPC works so they only get ingnored for like a minute
	"ignoredNPC": [],
	"previousDistance": false,
};
game.auto.setting = {
	"fixedSite": false,
	"useSoulGathering": false,
	
	"ruleHP_1_Pct": false,
	"ruleHP_1_Action": "",
	"ruleHP_2_Pct": false,
	"ruleHP_2_Action": "",
	"ruleMP_1_Pct": false,
	"ruleMP_1_Action": "",
	"ruleMP_2_Pct": false,
	"ruleMP_2_Action": "",
};
game.auto.slots = {
	"skills": [false, false, false, false, false, false],
	"items": [false, false, false, false, false, false],
};
game.auto.regen = {
	"hp": [7000,7001,7002,7003,7004,7005,7006,7007,7008],
	"mp": [7100,7101,7102,7103],
};

game.auto.buildInterface = function(){
	
	for(let k in game.auto.setting){
		game.auto.setting[k] = game.cookie.get("AUTO-SETTING-" + k, game.auto.setting[k]);
	}
	
	/** QUESTS LIST WINDOW UI **/
	game.auto.HTML = HTML_UI_BuildWindow("AUTO_UI_MAIN", {"x": game.cookie.get("AUTO_UI_MAIN-pos.x", 20), "y": game.cookie.get("AUTO_UI_MAIN-pos.y", 10), "width": 600, "height": 390, "title": LC_TEXT(game.lang, "UI.windows.auto.title")}, function(){game.auto.hide();});
	let contentFrame = ''
		+'<div style="margin-top: 6px;display: grid;grid-template-rows: auto 1fr;height: calc(100% - 6px);">'
			+'<div>'
				+ '<div class="ui-tab">'
					+ '<div class="ui-tab-option active" data-tab-target="#AUTO_UI_TAB1">' + LC_TEXT(game.lang, 'UI.windows.auto.tab.auto') + '</div>'
					+ '<div class="ui-tab-option" data-tab-target="#AUTO_UI_TAB2">' + LC_TEXT(game.lang, 'UI.windows.auto.tab.settings') + '</div>'
					+ '<div class="ui-tab-option" data-tab-target="#AUTO_UI_TAB4">' + LC_TEXT(game.lang, 'UI.windows.auto.tab.monsters') + '</div>'
				+ '</div>'
				+ '<div class="ui-tab-line"></div>'
			+'</div>'
			+ '<div class="auto-pane ui-tab-content-row">'
				// TAB 1
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB1" style="overflow: hidden;">'
					+ '<div class="auto-pics">'
						
					+ '</div>'
					+ '<div class="auto-start">'
						+ '<div class="auto-setting-fixedSite">'
							+ '<div class="auto-setting-fs-box">'
								+ '<input type="radio" name="fixedSite" value="0" checked /><span class="auto-fs-label auto-fs-label-no"></span>'
							+ '</div>'
							+ '<div class="auto-setting-fs-box">'
								+ '<input type="radio" name="fixedSite" value="1" /><span class="auto-fs-label auto-fs-label-yes"></span>'
							+ '</div>'
						+ '</div>'
						+ '<div class="ui-btn-table-sm" onclick="game.auto.toggleStart();">'
							+ '<div class="ui-btn-table-sm-left"></div>'
							+ '<div class="ui-btn-table-sm-middle auto-start-btn">' + LC_TEXT(game.lang, 'UI.windows.auto.btn.start') + '</div>'
							+ '<div class="ui-btn-table-sm-right"></div>'
						+ '</div>'
						+ '<div class="auto-setting-attackElite">'
							+ '<input onchange="game.auto.current.attackElite = this.checked" type="checkbox" checked />'
							+ '<span class="input-label">' + LC_TEXT(game.lang, 'UI.windows.auto.setting.attackElite') + '</span>'
						+ '</div>'
						+ '<div class="auto-setting-attackChief">'
							+ '<input onchange="game.auto.current.attackChief = this.checked" type="checkbox" checked />'
							+ '<span class="input-label">' + LC_TEXT(game.lang, 'UI.windows.auto.setting.attackChief') + '</span>'
						+ '</div>'
					+ '</div>'
				+ '</div>'
	;
	
	let sHpList = '<option value="" class="hp-nothing"></option>';
	sHpList += '<option value="SIT" class="hp-sit"></option>';
	for(let i = 0; i < game.auto.regen.hp.length; i++){
		let k = game.auto.regen.hp[i];
		sHpList += '<option value="' + k + '" class="hp-' + k + '"></option>'
	}
	let sMpList = '<option value="" class="mp-nothing"></option>';
	sMpList += '<option value="SIT" class="mp-sit"></option>';
	for(let i = 0; i < game.auto.regen.mp.length; i++){
		let k = game.auto.regen.mp[i];
		sMpList += '<option value="' + k + '" class="mp-' + k + '"></option>'
	}
	
	let sRule = '';
	for(let i = 0; i < 10; i++){
		sRule += '<option value="' + i + '" class="rule-' + i + '"></option>'
	}
	
	contentFrame += ''
				// TAB 2
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB2" style="display: none;">'
					+ '<div class="auto-p2-head">'
						+ '<div class="auto-p2h-hp">'
							+ '<div class="auto-rules-p2 auto-p2h-hp-l1">'
								+ '<div class="auto-p2h-hp-l11">' + LC_TEXT(game.lang, 'UI.stat.HP') + '</div>'
								+ '<div class="auto-p2h-hp-l12">'
									+ '<select class="auto-p2h-hp1-rule" onchange="game.auto.setSetting(\'ruleHP_1_Pct\', parseInt(this.value));">' 
										+ sRule
									+ '</select>'
								+ '</div>'
								+ '<div class="auto-p2h-hp-l13">' 
									+ '<select class="auto-p2h-hp1-input" onchange="game.auto.setSetting(\'ruleHP_1_Action\', this.value);">' 
										+ sHpList
									+ '</select>'
								+ '</div>'
							+ '</div>'
							+ '<div class="auto-rules-p2 auto-p2h-hp-l2">'
								+ '<div class="auto-p2h-hp-l21"></div>'
								+ '<div class="auto-p2h-hp-l22">'
									+ '<select class="auto-p2h-hp2-rule" onchange="game.auto.setSetting(\'ruleHP_2_Pct\', parseInt(this.value));">' 
										+ sRule
									+ '</select>'
								+ '</div>'
								+ '<div class="auto-p2h-hp-l23">' 
									+ '<select class="auto-p2h-hp2-input" onchange="game.auto.setSetting(\'ruleHP_2_Action\', this.value);">' 
										+ sHpList
									+ '</select>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
						+ '<div class="auto-p2h-mp">'
							+ '<div class="auto-rules-p2 auto-p2h-mp-l1">'
								+ '<div class="auto-p2h-mp-l11">' + LC_TEXT(game.lang, 'UI.stat.MP') + '</div>'
								+ '<div class="auto-p2h-mp-l12">'
									+ '<select class="auto-p2h-mp1-rule" onchange="game.auto.setSetting(\'ruleMP_1_Pct\', parseInt(this.value));">' 
										+ sRule
									+ '</select>'
								+ '</div>'
								+ '<div class="auto-p2h-mp-l13">' 
									+ '<select class="auto-p2h-mp1-input" onchange="game.auto.setSetting(\'ruleMP_1_Action\', this.value);">' 
										+ sMpList
									+ '</select>'
								+ '</div>'
							+ '</div>'
							+ '<div class="auto-rules-p2 auto-p2h-mp-l2">'
								+ '<div class="auto-p2h-mp-l21"></div>'
								+ '<div class="auto-p2h-mp-l22">'
									+ '<select class="auto-p2h-mp2-rule" onchange="game.auto.setSetting(\'ruleMP_2_Pct\', parseInt(this.value));">' 
										+ sRule
									+ '</select>'
								+ '</div>'
								+ '<div class="auto-p2h-mp-l23">' 
									+ '<select class="auto-p2h-mp2-input" onchange="game.auto.setSetting(\'ruleMP_2_Action\', this.value);">' 
										+ sMpList
									+ '</select>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					+ '</div>'
					+ '<div class="auto-p2-body">'
						+ '<div class="auto-p2b-left">'
						+ '</div>'
						+ '<div class="auto-p2b-right">'
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "1").outerHTML
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "2").outerHTML
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "3").outerHTML
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "4").outerHTML
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "5").outerHTML
							// + HTML_UI_BuildEmptySlot("", "auto-skill", "6").outerHTML
						+ '</div>'
					+ '</div>'
					+ '<div class="auto-p2-foot">'
					+ '</div>'
				+ '</div>'
				// TAB 3
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB3" style="display: none;">'
					
				+'</div>'
			+'</div>'
		+'</div>'
	+'</div>'
	;
	
	$(game.auto.HTML).find(".ui-body-content").append($(contentFrame));
	$("#UI_MAIN").append(game.auto.HTML);
	
	//Adding the minimap icon on top of the minimap, since the minimap doesn't work anyway LUL
	$(".minimap-radar-btn-auto").parent().append('<div class="minimap-radar-btn-realauto" title="Auto" onclick="game.auto.toggleVisible();" style="position: absolute;top:50px;right: 50px;background-image: url(' + game.assets.baseURL + 'ui/button/10_1.png);width: 29px;height: 28px;"></div>');
	
	$("#WF_STYLE").append($(''
		+ '<style id="WF_STYLE_AUTO_MAIN">'
		
		+ '#AUTO_UI_TAB1{padding-top: 10px;display: grid;grid-template-rows: auto 1fr; height: 100%;align-items: center;text-align: center;}'
		+ '#AUTO_UI_TAB1 .auto-pics{display: flex;overflow-x: auto;margin: auto;}'
		+ '#AUTO_UI_TAB1 .auto-npc-card {border: 1px solid rgba(181, 67, 0, 0.8);margin: 10px;padding:10px;text-align: center;min-width: 90px;display: grid;grid-template-rows: 1fr auto auto;background-color: rgba(255, 255, 255, 0.6);}'
		+ '#AUTO_UI_TAB1 .auto-npc-card .auto-npc-card-frame {align-content: center;}'
		+ '#AUTO_UI_TAB1 .auto-npc-card .auto-npc-card-frame .auto-npc-card-frame-fg {margin: auto;}'
		+ '#AUTO_UI_TAB1 .auto-fs-label {margin-left: 5px;}'
		
		+ '#AUTO_UI_TAB2{padding-top: 10px;display: grid;grid-template-rows: auto auto 1fr; grid-gap: 5px;; height: 100%;align-items: center;text-align: center;}'
		+ '#AUTO_UI_TAB2 .auto-p2-head {display: grid;grid-template-rows: 1fr 1fr;height: 100%;align-items: center;}'
		+ '#AUTO_UI_TAB2 .auto-rules-p2 {display: grid;grid-template-columns: 80px 1fr 1fr;text-align: center;}'
		+ '#AUTO_UI_TAB2 .auto-rules-p2 select {width: 80%;}'
		
		+ '#AUTO_UI_TAB2 .auto-p2-body {display: grid;grid-template-columns: 80px 1fr;text-align: center;}'
		+ '#AUTO_UI_TAB2 .auto-p2-body .auto-p2h-skill-card {display: inline-block;padding: 3px;margin: 3px;border: 1px solid rgba(181, 67, 0, 0.8);background-color: rgba(255, 255, 255, 0.6);}'
		
		+ '</style>'
	));
	
	// game.mouse.onMouseMove();
	// game.mouse.onMouseDown();
	
	document.addEventListener("keydown", function(event){
		if(!event.key){
			// console.warn('document.addEventListener("keydown") => event has no "key" index', event);
			return;
		}
		let sKey = event.key.toLowerCase();
		let sCode = event.code.toLowerCase();
		let oTarget = event.target;
		if(oTarget && game.chat && game.chat.HTML && game.chat.HTML.input && oTarget.id == game.chat.HTML.input.attr("id")){
			return true;
		}
		if(oTarget && ["input", "select", "textarea"].indexOf(oTarget.tagName.toLowerCase()) >= 0){
			if(oTarget.tagName.toLowerCase() != "input" || ["checkbox", "radio"].indexOf(oTarget.getAttribute("type")) == -1 ){
				return;
			}
		}
		
		if(sKey === "n"){
			game.auto.toggleStart();
		}else if(sKey === "a"){
			game.auto.toggleVisible();
		}
	});
	
	game.auto.__isBuild = true;
};

game.auto.setSetting = function(k, v){
	game.auto.setting[k] = v;
	game.cookie.set("AUTO-SETTING-" + k, v);
}

game.auto.refreshUI = function(){
	if(!game.auto.__isBuild){
		game.auto.buildInterface();
	}
	if(!game.auto.visible || !game.player || !game.scene.main.scene.visible){
		$("#AUTO_UI_MAIN").hide();
		return;
	}
	
	game.auto.refreshUI_Lang();
	game.auto.refreshUI_Npcs();
	game.auto.refreshUI_Settings();
	game.auto.refreshUI_Monsters();
	
	game.auto.Mouse_onMouseMove();
	
	$("#AUTO_UI_MAIN").show();
};

game.auto.refreshUI_Lang = function(){
	$("#AUTO_UI_MAIN .ui-title").html(LC_TEXT(game.lang, "UI.windows.auto.title"));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB1']").html(LC_TEXT(game.lang, 'UI.windows.auto.tab.auto'));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB2']").html(LC_TEXT(game.lang, 'UI.windows.auto.tab.settings'));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB3']").html(LC_TEXT(game.lang, 'UI.windows.auto.tab.monsters'));
	
	$("#AUTO_UI_TAB1 .auto-start-btn").html(LC_TEXT(game.lang, 'UI.windows.auto.btn.' + ((game.auto.current.active === true)?'stop':'start')));
	
	$("#AUTO_UI_TAB1 .auto-setting-attackElite .input-label").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.attackElite'));
	$("#AUTO_UI_TAB1 .auto-setting-attackChief .input-label").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.attackChief'));
	
	$("#AUTO_UI_TAB1 .auto-setting-fixedSite .auto-fs-label-no").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.fixedSite.no'));
	$("#AUTO_UI_TAB1 .auto-setting-fixedSite .auto-fs-label-yes").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.fixedSite.yes'));
	$("#AUTO_UI_TAB1 .auto-setting-fixedSite .auto-fs-label-no").attr("title", LC_TEXT(game.lang, 'UI.windows.auto.setting.fixedSite.no.description'));
	$("#AUTO_UI_TAB1 .auto-setting-fixedSite .auto-fs-label-yes").attr("title", LC_TEXT(game.lang, 'UI.windows.auto.setting.fixedSite.yes.description'));
	
	$("#AUTO_UI_TAB2 .auto-p2h-hp-l11").html(LC_TEXT(game.lang, 'UI.stat.HP'));
	$("#AUTO_UI_TAB2 .auto-p2h-mp-l11").html(LC_TEXT(game.lang, 'UI.stat.MP'));
	
	$("#AUTO_UI_TAB2 option.hp-nothing, #AUTO_UI_TAB2 option.mp-nothing").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.rule.nothing'));
	$("#AUTO_UI_TAB2 option.hp-sit, #AUTO_UI_TAB2 option.mp-sit").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.rule.sit'));
	
	
	for(let i = 0; i < game.auto.regen.hp.length; i++){
		let k = game.auto.regen.hp[i];
		let nQte = game.player.getItemQty(k, false);
		$("#AUTO_UI_TAB2 option.hp-" + k).html(LC_TEXT(game.lang, 'item.' + k + '.name') + ((nQte > 0)?' (x' + nQte + ')':''));
	}
	for(let i = 0; i < game.auto.regen.mp.length; i++){
		let k = game.auto.regen.mp[i];
		let nQte = game.player.getItemQty(k, false);
		$("#AUTO_UI_TAB2 option.mp-" + k).html(LC_TEXT(game.lang, 'item.' + k + '.name') + ((nQte > 0)?' (x' + nQte + ')':''));
	}
	
	
	$("#AUTO_UI_TAB2 option.rule-0").html(LC_TEXT(game.lang, 'UI.windows.auto.setting.rule.nothing'));
	for(let i = 1; i < 10; i++){
		$("#AUTO_UI_TAB2 option.rule-" + i).html(LC_TEXT(game.lang, 'UI.windows.auto.setting.rule.under', [i * 10]));
	}
	
	$("#AUTO_UI_TAB2 .auto-p2b-left").html(LC_TEXT(game.lang, 'UI.windows.skills.title'));
};

game.auto.refreshUI_Npcs = function(){
	let oChar = game.player;
	if(oChar === false){ return; }
	
	let sHtmlCards = '';
	
	for(let MID in game.auto.current.npcList){
		let oNpc = game.auto.current.npcList[MID];
		sHtmlCards += '<div class="auto-npc-card" id="auto-npc-card-' + MID + '">'
				+ '<div class="auto-npc-card-frame">' 
					+ '<div class="auto-npc-card-frame-fg" style="width: ' + oNpc.skin.frame.width + 'px;height: ' + oNpc.skin.frame.height + 'px;position: relative;overflow: hidden;">' 
					// + '<div class="auto-npc-card-frame-bg"></div>'
						+ '<img src="' + oNpc.skin.texture + '" style="top: -' + oNpc.skin.frame.y + 'px;left: -' + oNpc.skin.frame.x + 'px;position: absolute;" />'
					+ '</div>'
				+ '</div>'
				+ '<div class="auto-npc-card-level">' + LC_TEXT(game.lang, 'general.level.short') + ' ' + oNpc.level + '</div>'
				+ '<div class="auto-npc-card-input">'
					+ '<input '
						+ ((oNpc.selected)?' checked':'')
						+ ' onchange="game.auto.current.npcList[' + MID + '].selected = this.checked" '
						+ ' type="checkbox" '
					+ '/>'
				+ '</div>'
			+ '</div>'
		;
	}
	
	$("#AUTO_UI_TAB1 .auto-pics").html(sHtmlCards);
};
game.auto.refreshUI_Settings = function(){
	let oChar = game.player;
	if(oChar === false){ return; }
	
	$(".auto-p2h-hp1-rule").val(game.auto.setting.ruleHP_1_Pct);
	$(".auto-p2h-hp1-input").val(game.auto.setting.ruleHP_1_Action);
	$(".auto-p2h-hp2-rule").val(game.auto.setting.ruleHP_2_Pct);
	$(".auto-p2h-hp2-input").val(game.auto.setting.ruleHP_2_Action);
	
	$(".auto-p2h-mp1-rule").val(game.auto.setting.ruleMP_1_Pct);
	$(".auto-p2h-mp1-input").val(game.auto.setting.ruleMP_1_Action);
	$(".auto-p2h-mp2-rule").val(game.auto.setting.ruleMP_2_Pct);
	$(".auto-p2h-mp2-input").val(game.auto.setting.ruleMP_2_Action);
	
	let sSkillBase = game.player.classe + "_base";
	let sSkillHtml = '';
	for(let k in game.player.skills){
		if(k === sSkillBase){
			continue;
		}
		let oSkill = game.player.skills[k];
		if(!oSkill.proto || oSkill.proto.isPassive){
			continue;
		}
		let bValid = game.cookie.get("AUTO-SKILL-" + k, game.auto.Combat_skillIsValid(oSkill));
		
		// sSkillHtml += ''
			// + '<div class="auto-p2h-skill-card">'
				// + '<div class="auto-p2h-sc-head">'
					// + HTML_UI_BuildSlot("", "auto-skill", k, oSkill).outerHTML;
				// + '</div>'
				// + '<div class="auto-p2h-sc-foot">'
					// + '<input type="checkbox" ' + ((bValid)?' checked':'') + ' onchange="game.auto.Combat_skillSetState(\'' + k + '\', this.checked)" />'
				// + '</div>'
			// + '</div>'
		// ;
		// ??????????
		sSkillHtml += '<div class="auto-p2h-skill-card">';
		sSkillHtml += '<div class="auto-p2h-sc-head">';
		sSkillHtml += HTML_UI_BuildSlot("", "auto-skill", k, oSkill).outerHTML;
		sSkillHtml += '</div>';
		sSkillHtml += '<div class="auto-p2h-sc-foot">';
		sSkillHtml += '<input type="checkbox" ' + ((bValid)?' checked':'') + ' onchange="game.auto.Combat_skillSetState(\'' + k + '\', this.checked)" />';
		sSkillHtml += '</div>';
		sSkillHtml += '</div>';
	}
	
	$("#AUTO_UI_TAB2 .auto-p2b-right").html(sSkillHtml);
	
};
game.auto.refreshUI_Monsters = function(){
	let oChar = game.player;
	if(oChar === false){ return; }
	
	// Seems it won't happend
	// Would require some sync with the server to have to full list of seen mobs and their translated names / drops and everything
	
};




game.auto.visible = false;
game.auto.toggleVisible = function(){
	game.auto.visible = !game.auto.visible;
	game.auto.refreshUI();
	if(game.auto.visible){game.auto.pullWindow();}
};
game.auto.show = function(){
	game.auto.visible = true;
	game.auto.refreshUI();
	game.auto.pullWindow();
};
game.auto.hide = function(){
	game.auto.visible = false;
	game.auto.refreshUI();
};
game.auto.pullWindow = function(){
	game.zIndexPush("AUTO_UI_MAIN");
};

game.auto.toggleStart = function(){
	if(game.auto.current.active === true){
		game.auto.stop();
	}else{
		game.auto.start();
	}
};
game.auto.start = function(){
	game.auto.current.active = true;
	$("#AUTO_UI_TAB1 .auto-start-btn").html(LC_TEXT(game.lang, 'UI.windows.auto.btn.stop'));
};
game.auto.stop = function(){
	game.auto.current.active = false;
	$("#AUTO_UI_TAB1 .auto-start-btn").html(LC_TEXT(game.lang, 'UI.windows.auto.btn.start'));
};



game.auto.onTick = function(){
	if(!game.player){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	
	if(game.player.isDead){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	
	if(Date.now() < game.auto.current.tickDelay){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	//Currently to prevent a maximum the spam bug, force a delay in between ticks
	game.auto.current.tickDelay = Date.now() + 50;
	
	
	if(game.auto.current.map !== game.player.map){
		game.auto.current.map = game.player.map;
		game.auto.current.npcList = {};
		
	}
	game.auto.npcList.check();
	
	if(game.auto.current.active === true){
		game.auto.checkRules();
		game.auto.pickupItems();
		game.auto.pickupSouls();
		game.auto.onTickEvent[game.auto.current.state]();
	}else{
		game.auto.current.state = "idle";
	}
	
	requestAnimationFrame(game.auto.onTick);
};

game.auto.checkRules = function(){
	let nHP = game.player.health.value / game.player.health.max * 100;
	let nMP = game.player.mana.value / game.player.mana.max * 100;
	
	if(game.auto.setting.ruleHP_1_Pct && game.auto.setting.ruleHP_1_Pct * 10 >= nHP && game.auto.setting.ruleHP_1_Action){
		if(game.auto.setting.ruleHP_1_Action === "SIT"){
			if(game.auto.current.state === "idle"){
				game.auto.setState("regen");
				return false;
			}
		}else{
			game.useItemByIID(game.auto.setting.ruleHP_1_Action);
			game.auto.current.tickDelay = Date.now() + 5000;
		}
	}
	if(game.auto.setting.ruleHP_2_Pct && game.auto.setting.ruleHP_2_Pct * 10 >= nHP && game.auto.setting.ruleHP_2_Action){
		if(game.auto.setting.ruleHP_2_Action === "SIT"){
			if(game.auto.current.state === "idle"){
				game.auto.setState("regen");
				return false;
			}
		}else{
			game.useItemByIID(game.auto.setting.ruleHP_2_Action);
			game.auto.current.tickDelay = Date.now() + 5000;
		}
	}
	
	if(game.auto.setting.ruleMP_1_Pct && game.auto.setting.ruleMP_1_Pct * 10 >= nMP && game.auto.setting.ruleMP_1_Action){
		if(game.auto.setting.ruleMP_1_Action === "SIT"){
			if(game.auto.current.state === "idle"){
				game.auto.setState("regen");
				return false;
			}
		}else{
			game.useItemByIID(game.auto.setting.ruleMP_1_Action);
			game.auto.current.tickDelay = Date.now() + 5000;
		}
	}
	if(game.auto.setting.ruleMP_2_Pct && game.auto.setting.ruleMP_2_Pct * 10 >= nMP && game.auto.setting.ruleMP_2_Action){
		if(game.auto.setting.ruleMP_2_Action === "SIT"){
			if(game.auto.current.state === "idle"){
				game.auto.setState("regen");
				return false;
			}
		}else{
			game.useItemByIID(game.auto.setting.ruleMP_2_Action);
			game.auto.current.tickDelay = Date.now() + 5000;
		}
	}
};

game.auto.onTickEvent = {};
game.auto.onTickEvent.regen = function(){
	if(game.player.health.value === game.player.health.max && game.player.mana.value === game.player.mana.max){
		game.auto.setState("idle");
		return;
	}
	if(!game.player.isSitting){
		game._emit("entity_startSitting",[]);
		game.auto.current.tickDelay = Date.now() + 500;
	}
};

game.auto.onTickEvent.idle = function(){
	if(game.player.lockOn){
		game.auto.setState("combat");
		return;
	}
	
	if(game.auto.checkRules() === false){
		return;
	}
	
	//Search for next target
	let oClosest = game.auto.Combat_getClosestEntity();
	if(oClosest){
		console.log("Auto -> new target select [" + oClosest.uid + "]");
		game.setLockON(oClosest.uid, true, "auto");
		if(game.auto.setting.fixedSite){
			game.auto.setState("combat");
		}else{
			game.auto.setState("reaching");
		}
	}
};
game.auto.onTickEvent.combat = function(){
	if(!game.player.lockOn || game.player.lockOn.isDead){
		game.auto.current.ignoredNPC = [];
		game.auto.current.previousDistance = false;
		game.auto.setState("idle");
		return;
	}
	if(!game.auto.Combat_isInRange()){
		if(game.auto.setting.fixedSite){
			game.player.setLockON(false);
			game.auto.current.ignoredNPC = [];
			game.auto.current.previousDistance = false;
			game.auto.setState("idle");
		}else{
			game.auto.setState("reaching");
		}
		return;
	}
	
	if(game.player.isCasting){
		return;
	}
	
	let sSkillBase = game.player.classe + "_base";
	let oSkillBase = game.player.skills[sSkillBase];
	if(oSkillBase && oSkillBase.isReady(game.player)){
		game.player.askCastSkillOn(sSkillBase, game.player.lockOn);
		game.auto.current.tickDelay = Date.now() + 100;
	}
	
	for(let SkillID in game.player.skills){
	// for(let i = 0; i < game.auto.slots.length; i++){
		// let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		if(SkillID === sSkillBase){
			continue;
		}
		// if(!game.auto.Combat_skillIsValid(oSkill)){
		if(!game.cookie.get("AUTO-SKILL-" + SkillID, game.auto.Combat_skillIsValid(oSkill))){
			continue;
		}
		
		if(oSkill.haveRessources(game.player) !== 0){
			continue;
		}
		if(oSkill.isReady(game.player)){
			if(oSkill.proto.useOnEntity){
				game.player.askCastSkillOn(SkillID, game.player.lockOn);
			}else if(oSkill.proto.useOnGround){
				game.player.askCastSkillTo(SkillID, {"x": game.player.lockOn.x, "y": game.player.lockOn.y});
			}else{
				game.player.askCastSkill(SkillID);
				continue;
			}
			game.auto.current.tickDelay = Date.now() + 100;
			return;
		}
	};
};
game.auto.onTickEvent.reaching = function(){
	if(!game.player.lockOn || game.player.lockOn.isDead){
		game.auto.current.ignoredNPC = [];
		game.auto.current.previousDistance = false;
		game.auto.setState("idle");
		return;
	}
	if(game.auto.Combat_isInRange()){
		game.auto.setState("combat");
		return;
	}
	if(!game.player.isWalking){
		if(game.auto.current.previousDistance !== false && game.auto.current.previousDistance < game.utilities.distanceBetween(game.player, game.player.lockOn)){
			//If you get there, there is a problem, most likelly player is stuck on a wall
			//That mean you actually are now further away from the NPC while you also stopped walking (and not just the NPC got further away by walking too)
			
			game.auto.current.ignoredNPC.push(game.player.lockOn.uid);
			game.auto.current.previousDistance = false;
			game.player.setLockON(false);
			game.auto.setState("idle");
			game.auto.current.tickDelay = Date.now() + 200;
			return;
		}
		
		
		game.setTarget(game.player.lockOn.x, game.player.lockOn.y);
		game.auto.current.tickDelay = Date.now() + 100;
	}else if (game.player.target.yx + game.player.x != game.player.lockOn.x || game.player.target.y + game.player.y != game.player.lockOn.y){
		//Target is also moving, retargeting the character to get to him
		game.setTarget(game.player.lockOn.x, game.player.lockOn.y);
		game.auto.current.tickDelay = Date.now() + 200;
	}
	
	game.auto.current.previousDistance = game.utilities.distanceBetween(game.player, game.player.lockOn);
};
game.auto.setState = function(sState){
	game.auto.current.state = sState;
	console.log("Auto -> new state", sState);
	if(sState === "idle"){
		if(game.player.isWalking){
			game.setTarget(game.player.x, game.player.y);
		}
		game.player.inAutoAttack = false;
		
	}else if(sState === "combat" || sState === "reaching"){
		if(!game.player.lockOn || game.player.lockOn.isDead){
			game.auto.setState("idle");
			return;
		}
		if(sState === "combat"){
			if(game.player.isWalking){
				game.setTarget(game.player.x, game.player.y);
			}
			game.player.inAutoAttack = true;
		}else{
			game.player.inAutoAttack = false;
		}
	}
	game.auto.current.tickDelay = Date.now() + 500;
}

game.auto.Combat_getClosestEntity = function(){
	let nClosest = 999999999;
	let sUID = false;
	for(k in game.entities){
		let oEntity = game.entities[k];
		if(!oEntity.isPC && game.player.canDamage(oEntity)){
			if(game.auto.current.ignoredNPC.indexOf(oEntity.uid) >= 0){
				continue;
			}
			let MID = oEntity.mid;
			if(!game.auto.current.npcList.hasOwnProperty(MID)){
				continue;
			}
			if(!game.auto.current.npcList[MID].selected){
				continue;
			}
			if(oEntity.isElite && !game.auto.current.attackElite){
				continue;
			}
			if(oEntity.isChief && !game.auto.current.attackChief){
				continue;
			}
			//If only fixed site and entity is not in range
			if(game.auto.setting.fixedSite && !game.auto.Combat_isInRange(oEntity)){
				continue;
			}
			let nCurDist = game.utilities.distanceBetween(game.player, oEntity);
			if(nCurDist < nClosest){
				nClosest = nCurDist;
				sUID = k;
			}
		}
	}
	if(sUID && nClosest){
		return game.entities[sUID];
	}
	game.auto.current.tickDelay = Date.now() + 500;
	// if(game.auto.setting.fixedSite){
		//If fixed site and didn't found any entities, no need to spam the entity resreach, wait a bit for mobs to either respawn or move
	// }
	return false;
};
game.auto.Combat_isInRange = function(oEntity){
	let sSkillBase = game.player.classe + "_base";
	if(!game.player.skills[sSkillBase].inRange(game.player, ((oEntity)?oEntity:game.player.lockOn))){
		return false;
	}
	
	for(let i = 0; i < game.auto.slots.length; i++){
		let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		if(!game.auto.Combat_skillIsValid(oSkill)){
			continue;
		}
		if(!oSkill.inRange(game.player, ((oEntity)?oEntity:game.player.lockOn))){
			return false;
		}
	};
	
	return true;
};
game.auto.Combat_skillIsValid = function(oSkill){
	if(!oSkill){
		return false;
	}
	let oProto = oSkill.proto;
	if(!oProto || oProto.isPassive || !oProto.targetEnnemy || oProto.casttime > 0){
		return false;
	}
	
	return true;
};
game.auto.Combat_skillSetState = function(SkillID, bEnabled){
	game.cookie.set("AUTO-SKILL-" + SkillID, bEnabled);
};
game.auto.pickupItems = function(){
	let l = [];
	for(let k in game.groundItems){
		let oDrop = game.groundItems[k];
		if(!oDrop){
			continue;
		}
		if(oDrop.owners && oDrop.owners !== false && oDrop.owners.indexOf(game.player.uid) < 0){
			continue;
		}
		l.push(k);
	}
	if(l.length === 0){
		return;
	}
	game._emit("pickupMultipleItem", [l]);
};
game.auto.pickupSouls = function(){
	if(!game.SOUL_GATHERING.isActive() && game.auto.setting.useSoulGathering && game.player.specialsCount.SOUL_GATHERING > 0){
		game.SOUL_GATHERING.activate();
		game.auto.current.tickDelay = Date.now() + 500;
		return;
	}
	if(game.SOUL_GATHERING.isActive() && game.player.specialsCount.SOUL_GATHERING_LAST !== false){
		let nColor = game.player.specialsCount.SOUL_GATHERING_LAST;
		if(!nColor){
			nColor = 2;
		}
		let oGatherList = [];
		for(let k in game.SOUL_GATHERING.list){
			if(game.SOUL_GATHERING.list[k].color == nColor){
				oGatherList.push(k);
			}
		}
		
		if(oGatherList.length === 0){
			return;
		}
		
		game.SOUL_GATHERING.pickupSoulList(oGatherList);
	}
};



game.auto.npcList = {};
game.auto.npcList.lastCheck = 0;
game.auto.npcList.check = function(){
	if(!game.player){return;}
	if(game.auto.npcList.lastCheck + 2500 > Date.now()){return;}
	let bUpdate = false;
	
	game.auto.npcList.lastCheck = Date.now();
	
	for(let k in game.entities){
		let o = game.entities[k];
		if(o.isPC){
			continue;
		}
		if(!game.player.canDamage(o)){
			continue;
		}
		let MID = o.mid;
		if(!game.auto.current.npcList.hasOwnProperty(MID)){
			game.auto.current.npcList[MID] = new game.auto.npcList.proto(o);
			bUpdate = true;
		}else if(!game.auto.current.npcList[MID].skin.texture){
			game.auto.current.npcList[MID].setSkin(o);
		}
	}
	if(bUpdate){
		game.auto.refreshUI_Npcs();
	}
};

game.auto.npcList.proto = class{
	constructor(o){
		//Maybe at some point handle the idle stance ???
		if(!(o instanceof NPC)){
			throw new Error("Entity list object must be an instance of the NPC class");
		}
		this.skin = {
			"texture": false,
			"frame": {"x": 0, "y": 0, "width": 0, "height": 0},
		};
		this.setSkin(o);
		this.mid = o.mid;
		this.selected = true;
		this.level = o.level;
	}
	
	setSkin(o){
		if(!(o instanceof NPC)){
			throw new Error("Entity list object must be an instance of the NPC class");
		}
		if(o.skins.base.frames.hasOwnProperty("idle0")){
			this.skin.texture = o.skins.base.frames.idle0[0].sprite._texture.baseTexture.textureCacheIds[0];
			this.skin.frame.x = o.skins.base.frames.idle0[0].sprite._texture.frame.x;
			this.skin.frame.y = o.skins.base.frames.idle0[0].sprite._texture.frame.y;
			this.skin.frame.width = o.skins.base.frames.idle0[0].sprite._texture.frame.width;
			this.skin.frame.height = o.skins.base.frames.idle0[0].sprite._texture.frame.height;
		}else{
			
		}
	}
}

game.auto.Mouse_onMouseMove = function(){
	if(!game.player){
		
	}
	let sSelector = "#AUTO_UI_MAIN .ui-slot";
	$(sSelector).unbind("mousemove");
	$(sSelector).mousemove(function(event){
	
		if($(this).hasClass("no-mouse-events")){
			return;
		}

		let bPreventDefault = false;

		let oPos = {
			"x": event.offsetX, "y": event.offsetY,
			"pageX": event.pageX, "pageY": event.pageY,
			"rx": game.RxToPx(event.pageX), "ry": game.RyToPy(event.pageY),
			"radiant": false,
			"rotation": false
		};
		
		if(!game.scene.main.layer.main.visible){
			return;
		}
		let self = $(this);
		if(game.player){
			if(self.hasClass("ui-slot")){
				let slotType = self.attr("data-slot-type");
				let slotID = self.attr("data-slot-id");
				let oContent = false;
				let oContentType = "item";
				
				if(slotType == "auto-skill"){
					oContentType = "skill";
					let sid = self.attr("data-sid");
					if(sid){
						if(game.player.skills.hasOwnProperty(sid)){
							oContent = game.player.skills[sid];
						}else{
							oContent = new skill({"sid": sid, "level": false});
						}
					}
				}
				
				if(oContent){
					bColission = true;
					bPreventDefault = true;
					if(game.mouse.hoverElement !== false && (slotType != game.mouse.hoverElement.slotType || slotID != game.mouse.hoverElement.slotID)){
						if(game.mouse.tooltipElement !== false){
							game.mouse.tooltipElement.remove();
							game.mouse.tooltipElement = false;
						}
					}
					game.mouse.hoverElement = {
						"type": oContentType,
						"object": oContent,
						"slotType": slotType,
						"slotID": slotID
					};
				}
			}
		}
		
		if(bColission === false){
			game.mouse.hoverElement = false;
		}
		
		game.mouse.refreshTooltip();
		
		if(bPreventDefault){
			event.preventDefault();
			return false;
		}
	});
}



$(document).ready(() => {
	game.UI.list.push(game.auto);
	locale["UI.windows.auto.title"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
	locale["UI.windows.auto.tab.auto"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
	locale["UI.windows.auto.tab.settings"] = {"en": "Settings", "fr": "Paramètres"};
	locale["UI.windows.auto.tab.monsters"] = {"en": "Monsters", "fr": "Monstres"};
	
	locale["UI.windows.auto.btn.start"] = {"en": "Start", "fr": "Démarer"};
	locale["UI.windows.auto.btn.stop"] = {"en": "Stop", "fr": "Arrêter"};
	
	locale["UI.windows.auto.setting.attackElite"] = {"en": "Attack elites", "fr": "Attaquer les elites"};
	locale["UI.windows.auto.setting.attackChief"] = {"en": "Attack chiefs", "fr": "Attaquer les chefs"};
	locale["UI.windows.auto.setting.fixedSite.no"] = {"en": "Move and attack", "fr": "Attaquer et se déplacer"};
	locale["UI.windows.auto.setting.fixedSite.yes"] = {"en": "Attack & don't move", "fr": "Attaquer et ne pas se déplacer"};
	locale["UI.windows.auto.setting.fixedSite.no.description"] = {"en": "The character will patrol the map to kill monsters", "fr": "Le personnage patrouillera sur la carte pour tuer des monstres."};
	// locale["UI.windows.auto.setting.fixedSite.yes.description"] = {"en": "The character will patrol in a certain area to kill monsters", "fr": "Le personnage patrouillera dans une certaine zone pour tuer des monstres."};
	locale["UI.windows.auto.setting.fixedSite.yes.description"] = {"en": "The character will stand still and kill monsters that are in range", "fr": "Le personnage reste immobile et tue les monstres qui sont à sa portée."};
	
	locale["UI.windows.auto.setting.rule.under"] = {"en": "Lower than {0}%", "fr": "En dessous de {0}%"};
	
	locale["UI.windows.auto.setting.rule.nothing"] = {"en": "Do nothing", "fr": "No rien faire"};
	locale["UI.windows.auto.setting.rule.sit"] = {"en": "Sit and rest", "fr": "S'assoir et se reposer"};
	
	game.auto.onTick();
	game.UI.refreshUI()
});
}

//Instead of having a long delay, try every second to inject the code
setTimeout(() => {
	___autoInit();
},1000);
})()