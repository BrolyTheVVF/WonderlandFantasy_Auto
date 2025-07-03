// ==UserScript==
// @name         WF Auto Pilot
// @namespace    http://tampermonkey.net/
// @version      2025-07-03.001
// @description  try to take over the world! (of WF :mocking:)
// @author       BrolyTheVVF
// @match        https://*.wonderland-fantasy.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wonderland-fantasy.com
// @grant        none
// ==/UserScript==

(function() {
function ___autoInit(){
//Waiting for socket as when it is started, all base JS files are loaded
if(!game || (!game.player && (!game.scene || !game.scene.login || !game.scene.login.scene.visible)) || !game.socket){
	setTimeout(() => {
		___autoInit();
	},1000);
	return;
}

//HAVE TO FIND ANOTHER DOMAIN CAUSE THIS ONE CANNOT BE USED AS A CDN, IT'S AGAINST THE ToS OF GITHUB
// game.EXT_SOURCE_PATH = "https://raw.githubusercontent.com/BrolyTheVVF/WonderlandFantasy_Auto/refs/heads/main/";
game.EXT_SOURCE_PATH = "https://wf-bot.menillia.fr/main/";
if(game.IS_PTR){
	game.EXT_SOURCE_PATH = "https://wf-bot.menillia.fr/dev/";
}

game.loadExternalScript = function(url) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.type = 'text/javascript';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
};
game.loadExternalJson = function(url) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		
		xhr.open('GET', url, true);

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) { // DONE
				if (xhr.status === 200) {
					try {
						const data = JSON.parse(xhr.responseText);
						resolve(data);
					} catch (err) {
						reject(`Erreur de parsing JSON: ${err}`);
					}
				} else {
					reject(`Erreur HTTP: ${xhr.status}`);
				}
			}
		};

		xhr.onerror = () => reject("Erreur de réseau");

		xhr.send();
	});
};

game.auto = {};
game.auto = {};
game.auto.version = "2025-07-03.001";
game.auto.HTML = false;
game.auto.current = {
	"map": false,
	"npcList": {},
	"active": false,
	"state": "idle",
	"tickDelay": 0,
	
	"Combat_skillRotation": [],
	
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
	
	"attackElite": 'on',
	"attackChief": 'on',
	
	"CharacterSelected": false,
	
	"Craft_autoSell": false,
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
	game.auto.triggerEvent("src_onBefore_buildInterface", []);
	
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
					+ '<div class="ui-tab-option" data-tab-target="#AUTO_UI_TAB3">' + LC_TEXT(game.lang, 'UI.windows.auto.tab.other') + '</div>'
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
							+ '<input onchange="game.auto.setSetting(\'attackElite\', ((this.checked)?\'on\':\'off\'))" type="checkbox" ' +  ((game.auto.getSetting('attackElite', 'on') === 'on')?' checked':'') + ' />'
							+ '<span class="input-label">' + LC_TEXT(game.lang, 'UI.windows.auto.setting.attackElite') + '</span>'
						+ '</div>'
						+ '<div class="auto-setting-attackChief">'
							+ '<input onchange="game.auto.setSetting(\'attackChief\', ((this.checked)?\'on\':\'off\'))" type="checkbox" ' +  ((game.auto.getSetting('attackChief', 'on') === 'on')?' checked':'') + ' />'
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
					+ '<div class="tab-other-line">'
						+ '<input onchange="game.auto.setSetting(\'Craft_autoSell\', ((this.checked)?\'on\':\'off\'))" type="checkbox" ' +  ((game.auto.getSetting('Craft_autoSell', 'on') === 'on')?' checked':'') + ' />'
						+ '<span class="input-label">' + LC_TEXT(game.lang, 'UI.windows.auto.setting.craft.autoSell') + '</span>'
					+'</div>'
				+'</div>'
				// TAB 4
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB4" style="display: none;">'
					
				+'</div>'
			+'</div>'
		+'</div>'
	+'</div>'
	;
	
	$(game.auto.HTML).find(".ui-body-content").append($(contentFrame));
	$("#UI_MAIN").append(game.auto.HTML);
	
	//Adding the minimap icon on top of the minimap, since the minimap doesn't work anyway LUL
	$(".minimap-radar-btn-auto").parent().append('<div class="minimap-radar-btn-realauto" title="Auto" onclick="game.auto.toggleVisible();" style="position: absolute;top:50px;right: 50px;background-image: url(' + game.assets.baseURL + 'ui/button/10_1.png);width: 29px;height: 28px;"></div>');
	
	$("body").append($('<div id="AUTO_STYLE"></div>'));
	$("#AUTO_STYLE").append($(''
		+ '<style id="WF_STYLE_AUTO_MAIN">'
		
		+ '#AUTO_UI_TAB1{padding-top: 10px;display: grid;grid-template-rows: auto 1fr; height: 100%;align-items: center;text-align: center;}'
		+ '#AUTO_UI_TAB1 .auto-pics{display: flex;overflow-x: auto;margin: auto;max-width: 100%;}'
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
		
		//Overwrite some of the current game's stylesheets
		+ '#crafting-number {width: 100px !important;}'
		
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
	game.auto.triggerEvent("src_onAfter_buildInterface", []);
};

game.auto.setSetting = function(k, v){
	game.auto.setting[k] = v;
	game.cookie.set("AUTO-SETTING-" + k, v);
}
game.auto.getSetting = function(k, sDef){
	if(!game.auto.setting.hasOwnProperty(k)){
		return sDef;
	}
	return game.auto.setting[k];
	// game.cookie.set("AUTO-SETTING-" + k, v);
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
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB3']").html(LC_TEXT(game.lang, 'UI.windows.auto.tab.other'));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB4']").html(LC_TEXT(game.lang, 'UI.windows.auto.tab.monsters'));
	
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
						+ ((oNpc.skin.texture)
							?'<img src="' + oNpc.skin.texture + '" style="top: -' + oNpc.skin.frame.y + 'px;left: -' + oNpc.skin.frame.x + 'px;position: absolute;" />'
							:'<img src="' + game.assets.baseURL + 'icon/0.png" style="top: 50%;left: 50%;position: absolute;transform: translate(-50%, -50%);" />'
						)
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
		let bValid = game.auto.Combat_skillGetState(k, ((game.auto.Combat_skillIsValid(oSkill))?'on':'off')) === 'on';
		
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
		sSkillHtml += '<input type="checkbox" ' + ((bValid)?' checked':'') + ' onchange="game.auto.Combat_skillSetState(\'' + k + '\', ((this.checked)?\'on\':\'off\'))" />';
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
	if(game.player){
		game.auto.setSetting("CharacterSelected", game.player.uid);
	}
};
game.auto.stop = function(){
	game.auto.current.active = false;
	$("#AUTO_UI_TAB1 .auto-start-btn").html(LC_TEXT(game.lang, 'UI.windows.auto.btn.start'));
	//Only update if you are in game in case you  press n by mistake on the character selection waiting for the game to load back in
	if(game.player){
		game.auto.setSetting("CharacterSelected", false);
	}
};



game.auto.onTick = function(){
	
	if(Date.now() < game.auto.current.tickDelay){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	
	if(game.socket && game.socket.readyState !== game.socket.OPEN && game.auto.current.active === true){
		document.location = document.location.href;
	}
	
	if(!game.player){
		
		game.auto.onCharSelScreen();
		
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	
	if(game.player.isDead){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	//Currently to prevent a maximum the spam bug, force a delay in between ticks
	game.auto.current.tickDelay = Date.now() + 50;
	//Force reset this to false as i forgot to make it proprely rest in some cases
	game.login.selected.pending = false;
	
	
	if(game.auto.current.map !== game.player.map){
		game.auto.current.map = game.player.map;
		game.auto.current.npcList = {};
		
	}
	game.auto.npcList.check();
	
	game.auto.triggerEvent("onTick",[]);
	
	if(game.auto.current.active === true && !game.map.current.isSpecial){
		game.auto.triggerEvent("onActiveTick",[]);
		game.auto.checkRules();
		game.auto.pickupItems();
		game.auto.pickupSouls();
		game.auto.onTickEvent[game.auto.current.state]();
	}else{
		game.auto.current.state = "idle";
		game.auto.triggerEvent("onInactiveTick",[]);
	}
	
	requestAnimationFrame(game.auto.onTick);
};

game.auto.onCharSelScreen = function(){
	if(!game.auto.setting.CharacterSelected){
		return;
	}
	if(!game.scene.login.scene.visible){
		return;
	}
	if(!game.login || !game.login.selected || game.login.selected.pending){
		return;
	}
	for(let i = 1; i <= 3; i++){
		if(game.login["selchar" + i].uid !== game.auto.setting.CharacterSelected){
			continue;
		}
		game.login["selchar" + i].__onClick();
		game.login.validButton.__onClick();
		game.auto.current.tickDelay = Date.now() + 1000;
		game.auto.start();
		return;
	}
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
			game.auto.current.tickDelay = Date.now() + 500;
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
			game.auto.current.tickDelay = Date.now() + 500;
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
			game.auto.current.tickDelay = Date.now() + 500;
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
			game.auto.current.tickDelay = Date.now() + 500;
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
		if(game.IS_PTR){console.log("Auto -> new target select [" + oClosest.uid + "]");}
		game.setLockON(oClosest.uid, true, "auto");
		if(game.auto.setting.fixedSite){
			game.auto.setState("combat");
		}else{
			game.auto.setState("reaching");
		}
	}
};
game.auto.onTickEvent.combat = function(){
	if(!game.player.lockOn || game.player.lockOn.isDead || game.player.lockOn.uid === game.player.uid){
		game.auto.current.ignoredNPC = [];
		game.auto.current.previousDistance = false;
		game.player.setLockON(false)
		game.auto.setState("idle");
		game.auto.current.tickDelay = Date.now() + 100;
		return;
	}
	if(game.player.lockOn && (!game.player.canDamage(game.player.lockOn) || game.player.lockOn.isPC)){
		game.auto.current.ignoredNPC = [];
		game.auto.current.previousDistance = false;
		game.player.setLockON(false)
		game.auto.setState("idle");
		game.auto.current.tickDelay = Date.now() + 100;
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
		oSkillBase.lastUse = Date.now() + 20;//20 ms for the minimum network delay, hope the skill doesn't fail Kappa
		// game.auto.current.tickDelay = Date.now() + 100;
	}
	
	for(let i = 0; i < game.auto.current.Combat_skillRotation.length; i++){
		let SkillID = game.auto.current.Combat_skillRotation[i];
	// for(let SkillID in game.player.skills){
	// for(let i = 0; i < game.auto.slots.length; i++){
		// let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		if(SkillID === sSkillBase){
			continue;
		}
		// if(!game.auto.Combat_skillIsValid(oSkill)){
		if(game.auto.Combat_skillGetState(SkillID, ((game.auto.Combat_skillIsValid(oSkill))?'on':'off')) !== 'on'){
			continue;
		}
		
		if(oSkill.haveRessources(game.player) !== 0){
			continue;
		}
		if(oSkill.isReady(game.player)){
			if(oSkill.proto.useOnEntity){
				let oTarget = game.player.lockOn;
				if(oSkill.proto.targetAlly){
					oTarget = game.player;
				}
				game.player.askCastSkillOn(SkillID, oTarget);
			}else if(oSkill.proto.useOnGround){
				game.player.askCastSkillTo(SkillID, {"x": game.player.lockOn.x, "y": game.player.lockOn.y});
			}else{
				game.player.askCastSkill(SkillID);
			}
			// oSkill.lastUse = Date.now() + 20;//20 ms for the minimum network delay, hope the skill doesn't fail Kappa
			// game.player.GCD.skill = Date.now() + entity.CONST.GCD;
			
			if(game.IS_PTR){console.log("Auto -> Combat - using skill [" + SkillID + "]");}
			//We move the skill back to the end so that his priority is last
			game.auto.current.Combat_skillRotation.splice(i, 1);
			game.auto.current.Combat_skillRotation.push(SkillID);
			
			if(game.IS_PTR){console.log(game.auto.current.Combat_skillRotation);}
			
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
	if(game.IS_PTR){console.log("Auto -> new state", sState);}
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
			//Let the rotation handle the auto attack
			game.player.inAutoAttack = false;
			game.auto.Combat_skillBuildRotation();
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
			if(oEntity.hasBuff("MOB_ELITE") && game.auto.getSetting('attackElite', 'on') !== 'on'){
				continue;
			}
			if(oEntity.hasBuff("MOB_CHIEF") && game.auto.getSetting('attackChief', 'on') !== 'on'){
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
	
	for(let SkillID in game.player.skills){
	// for(let i = 0; i < game.auto.slots.length; i++){
		// let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		if(game.auto.Combat_skillGetState(SkillID, ((game.auto.Combat_skillIsValid(oSkill))?'on':'off')) !== 'on'){
			continue;
		}
		//Skill doesn't use the range attribute
		if(!oSkill.proto.useOnGround && (!oSkill.proto.useOnEntity || !oSkill.proto.targetEnnemy)){
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
	let i = game.auto.current.Combat_skillRotation.indexOf(SkillID);
	if(bEnabled === 'on'){
		if(i < 0){
			game.auto.current.Combat_skillRotation.push(SkillID);
		}
	}else{
		if(i >= 0){
			game.auto.current.Combat_skillRotation.splice(i , 1);
		}
	}
};
game.auto.Combat_skillGetState = function(SkillID, bDefault){
	return game.cookie.get("AUTO-SKILL-" + SkillID, bDefault);
};

//Latter use this to buile a rotation with a priority config, either already prebuilt or configured by the player
game.auto.Combat_skillBuildRotation = function(){
	game.auto.current.Combat_skillRotation = [];
	let sSkillBase = game.player.classe + "_base";
	for(let SkillID in game.player.skills){
		if(sSkillBase === SkillID){
			continue;
		}
		
		let oSkill = game.player.skills[SkillID];
		if(game.auto.Combat_skillGetState(SkillID, ((game.auto.Combat_skillIsValid(oSkill))?'on':'off')) !== 'on'){
			continue;
		}
		game.auto.current.Combat_skillRotation.push(SkillID);
	}
	
	
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
		if(!game.group.o || game.utilities.inCircleRange(game.player, oDrop, 600)){
			l.push(k);
		}
		// l.push(k);
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
	if(game.SOUL_GATHERING.isActive()){
		let nColor = game.player.specialsCount.SOUL_GATHERING_LAST;
		if(nColor === false && Object.keys(game.SOUL_GATHERING.list).length > 0){
			nColor = game.SOUL_GATHERING.list[Object.keys(game.SOUL_GATHERING.list)[0]].color
			// nColor = 2;
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


game.auto.on_replaced = {};

game.auto.events = {};
game.auto.events.list = {};
game.auto.events.replace = function(sEvent){
	if(!game.on.hasOwnProperty(sEvent)){
		return false;
	}
	game.auto.on_replaced[sEvent] = game.on[sEvent];
	game.on[sEvent] = function(...args){
		game.auto.triggerEvent("onBefore_" + sEvent,args);
		game.auto.on_replaced[sEvent](...args);
		game.auto.triggerEvent("onAfter_" + sEvent,args);
	}
	return true;
}

game.auto.triggerEvent = function(t, a){
	if(!game.auto.events.list.hasOwnProperty(t)){
		// console.warn("game.auto.events doesn't have a valid [" + t + "] registered event");
		return;
	}
	for(let k in game.auto.events.list[t]){
		//We never know
		if(!game.auto.events.list[t][k] || typeof game.auto.events.list[t][k] !== "function"){
			continue;
		}
		game.auto.events.list[t][k](...a);
	}
};

game.auto.registerEvent = function(t, k, f){
	if(typeof f !== "function"){
		console.error("game.auto.registerEvent => WARNING, TRYING TO REGISTER AN EVENT WITHOUT A VALID FUNCTION");
		console.log(t);
		console.log(k);
		console.log(f);
		return false;
	}
	if(!game.auto.events.list.hasOwnProperty(t)){
		game.auto.events.list[t] = {};
	}
	game.auto.events.list[t][k] = f;
};
game.auto.unregisterEvent = function(t, k){
	if(!game.auto.events.list.hasOwnProperty(t)){
		game.auto.events.list[t] = {};
	}
	delete game.auto.events.list[t][k];
};

game.auto.registerEvent("onTick", "main", function(){
	
});
game.auto.registerEvent("onActiveTick", "main", function(){
	
});
game.auto.registerEvent("onInactiveTick", "main", function(){
	
});
game.auto.registerEvent("onAfterDamage", "main", function(){
	
});

//Online Time Reward auto gather
game.auto.registerEvent("onActiveTick", "onlineTimeReward", function(){
	if(!game.online_time_reward.isActive()){
		return;
	}
	let nTimeLeft = game.online_time_reward.getTimeLeft();
	if(nTimeLeft === false || nTimeLeft > 0){
		return;
	}
	game.auto.current.tickDelay = Date.now() + 1500;
	game._emit("onlineTimeReward_gatherReward");
});

//Auto lock ennemies
game.auto.registerEvent("onAfterDamage", "AutoLock", function(targetUid, oDamage, fromUid, newHealthPoint){
	if(!game.player || targetUid !== game.player.uid){
		// console.log("game.auto.event::onAfterDamage.targetUid => ", targetUid, game.player.uid);
		return;
	}
	if(!fromUid || fromUid === game.player.uid){
		// console.log("game.auto.event::onAfterDamage.fromUid => ", fromUid, game.player.uid);
		return;
	}
	if(game.player.lockOn && !game.player.lockOn.isDead){
		// console.log("game.auto.event::onAfterDamage.lockOn => ", game.player.lockOn);
		return;
	}
	if(game.entities[fromUid].isPC){
		return;
	}
	game.player.setLockON(game.entities[fromUid]);
	if(game.auto.current.active === true){
		game.auto.setState("combat");
	}
});

//Craft auto sell
game.auto.registerEvent("onAfter_craft_craftingDone", "AutoSell", function(targetUid, oDamage, fromUid, newHealthPoint){
	if(game.IS_PTR){console.log("game.player.bag.getFreeSpace()", game.player.bag.getFreeSpace());}
	if(!game.craft.isCrafting || game.player.bag.getFreeSpace() < 5){
		game.bag.sellCommonGear();
		//Crafting is done or bag is almost full, sell everything
		// if(!game.craft.recipeSelected || game.craft.recipeSelected.isUpgrade){
			// return;
		// }
		// let iid = game.craft.recipeSelected.result.iid;
		// if(!iid){
			// return;
		// }
		// let nBagSize = game.player.bag.getSize();
		// for(let i = 0; i < nBagSize; i++){
			// let oItem = game.player.bag.content[i];
			// if(!oItem){
				// continue;
			// }
		// }
	}
});


$(document).ready(() => {
	
	(async () => {
		try{
			await game.loadExternalScript(game.EXT_SOURCE_PATH + 'hello.js?v=' + game.auto.version);
			await game.loadExternalScript(game.EXT_SOURCE_PATH + 'UI_Debug_Stylesheet.js?v=' + game.auto.version);
			await game.loadExternalScript(game.EXT_SOURCE_PATH + 'SYS_MemLeak.js?v=' + game.auto.version);
			await game.loadExternalScript(game.EXT_SOURCE_PATH + 'SYS_PathFinding.js?v=' + game.auto.version);
		}catch(e){
			console.log(e);
		}

		game.UI.list.push(game.auto);
		locale["UI.windows.auto.title"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
		locale["UI.windows.auto.tab.auto"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
		locale["UI.windows.auto.tab.settings"] = {"en": "Settings", "fr": "Paramètres"};
		locale["UI.windows.auto.tab.other"] = {"en": "Other", "fr": "Autre"};
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
		
		locale["UI.windows.auto.setting.craft.autoSell"] = {"en": "Craft: Auto sell all common gear when almost full", "fr": "Artisanat : Vente automatique de tout le matériel commun lorsque le sac est presque plein"};
		
		game.on.onlineTimeReward_gatherReward = function(oRewards, onlineTimeRewardStep){
			if(!game.player){return;}
			game.player.onlineTimeRewardStep = onlineTimeRewardStep;
			game.player.loginCumulatedTime = 0;
			game.player.loginTime = Date.now();
			if(game.auto.current.active){
				return;
			}
			let sHtml = "";
			for(let i = 0; i < oRewards.length; i++){
				let oItem = new item(oRewards[i]);
				sHtml += HTML_UI_BuildSlot("", "onlineTimeReward", i, oItem).outerHTML;
			}
			game.renderPopup(LC_TEXT(game.lang, "general.label.reward"),sHtml,200,140,[{"id": "OK", "text": LC_TEXT(game.lang, "UI.windows.confirm"), "onclick": function(){}, "escapeClick": true, "enterValidate": true}]);
		};
		
		game.auto.onTick();
		game.UI.refreshUI();
		
		game.auto.on_replaced.damage = game.on.damage;
		game.on.damage = function(...args){
			// console.log("game.on.damage", args);
			game.auto.triggerEvent("onBeforeDamage",args);
			game.auto.on_replaced.damage(...args);
			game.auto.triggerEvent("onAfterDamage",args);
		}
		
		game.auto.events.replace("craft_craftingDone");
		game.auto.events.replace("playerChangeMap");
	})();
	
});
}

//Instead of having a long delay, try every second to inject the code
setTimeout(() => {
	___autoInit();
},1000);
})()
