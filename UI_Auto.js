// ==UserScript==
// @name         WF Auto Pilot
// @namespace    http://tampermonkey.net/
// @version      2025-05-18.005
// @description  try to take over the world!
// @author       BrolyTheVVF
// @match        https://*.wonderland-fantasy.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wonderland-fantasy.com
// @grant        none
// ==/UserScript==

(function() {
setTimeout(() => {


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
};
game.auto.setting = {
	"fixedSite": false,
	"useSoulGathering": false,
};
game.auto.slots = {
	"skills": [false, false, false, false, false, false],
	"items": [false, false, false, false, false, false],
};

game.auto.buildInterface = function(){
	/** QUESTS LIST WINDOW UI **/
	game.auto.HTML = HTML_UI_BuildWindow("AUTO_UI_MAIN", {"x": game.cookie.get("AUTO_UI_MAIN-pos.x", 20), "y": game.cookie.get("AUTO_UI_MAIN-pos.y", 10), "width": 600, "height": 390, "title": LC_TEXT(game.lang, "UI.windows.auto.title")}, function(){game.auto.hide();});
	let contentFrame = $(''
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
				// TAB 2
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB2" style="display: none;">'
					+ '<div class="auto-p2-head">'
						+ '<div class="auto-p2h-hp">'
						+ '</div>'
						+ '<div class="auto-p2h-mp">'
							
						+ '</div>'
					+ '</div>'
					+ '<div class="auto-p2-body">'
						+ '<div class="auto-p2b-left">'
						+ '</div>'
						+ '<div class="auto-p2b-right">'
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "1").outerHTML
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "2").outerHTML
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "3").outerHTML
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "4").outerHTML
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "5").outerHTML
							+ HTML_UI_BuildEmptySlot("", "auto-skill", "6").outerHTML
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
	);
	
	$(game.auto.HTML).find(".ui-body-content").append(contentFrame);
	$("#UI_MAIN").append(game.auto.HTML);
	
	//Adding the minimap icon on top of the minimap, since the minimap doesn't work anyway LUL
	$(".minimap-radar-btn-auto").parent().append('<div class="minimap-radar-btn-realauto" title="DPS Meter" onclick="game.auto.toggleVisible();" style="position: absolute;top:50px;right: 50px;background-image: url(' + game.assets.baseURL + 'ui/button/10_1.png);width: 29px;height: 28px;"></div>');
	
	$("#WF_STYLE").append($(''
		+ '<style id="WF_STYLE_AUTO_MAIN">'
		
		+ '#AUTO_UI_TAB1{padding-top: 10px;display: grid;grid-template-rows: auto 1fr; height: 100%;align-items: center;text-align: center;}'
		+ '#AUTO_UI_TAB1 .auto-pics{display: flex;overflow-x: auto;margin: auto;}'
		+ '#AUTO_UI_TAB1 .auto-npc-card {border: 1px solid rgba(0, 0, 0, 0.8);margin: 10px;padding:10px;text-align: center;min-width: 90px;display: grid;grid-template-rows: 1fr auto auto;}'
		+ '#AUTO_UI_TAB1 .auto-npc-card .auto-npc-card-frame {align-content: center;}'
		+ '#AUTO_UI_TAB1 .auto-npc-card .auto-npc-card-frame .auto-npc-card-frame-fg {margin: auto;}'
		+ '#AUTO_UI_TAB1 .auto-fs-label {margin-left: 5px;}'
		
		+ '</style>'
	));
	
	game.auto.__isBuild = true;
};

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
	
	if(Date.now() < game.auto.current.tickDelay){
		requestAnimationFrame(game.auto.onTick);
		return;
	}
	
	if(game.auto.current.map !== game.player.map){
		game.auto.current.map = game.player.map;
		game.auto.current.npcList = {};
		
	}
	game.auto.npcList.check();
	if(game.auto.current.active === true){
		game.auto.pickupItems();
		game.auto.pickupSouls();
		game.auto.onTickEvent[game.auto.current.state]();
	}else{
		game.auto.current.state = "idle";
	}
	
	requestAnimationFrame(game.auto.onTick);
};

game.auto.onTickEvent = {};
game.auto.onTickEvent.idle = function(){
	if(game.player.lockOn){
		game.auto.setState("combat");
		return;
	}
	//Search for next target
	let oClosest = game.auto.Combat_getClosestEntity();
	if(oClosest){
		console.log("Auto: new target select [" + oClosest.uid + "]");
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
		game.auto.setState("idle");
		return;
	}
	if(!game.auto.Combat_isInRange()){
		if(game.auto.setting.fixedSite){
			game.player.lockOn = false;
			game.auto.setState("idle");
		}else{
			game.auto.setState("reaching");
		}
		return;
	}
	let sSkillBase = game.player.classe + "_base";
	let oSkillBase = game.player.skills[sSkillBase];
	if(oSkillbase.isReady(game.player)){
		game.player.askCastSkillOn(sSkillBase, game.player.lockOn);
		game.auto.current.tickDelay = Date.now() + 100;
	}
	
	for(let i = 0; i < game.auto.slots.length; i++){
		let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		let oProto = oSkill.proto;
		if(oProto.isPassive){
			continue;
		}
		if(!oProto.targetEnnemy){
			continue;
		}
		
		if(oSkill.isReady(game.player)){
			game.player.askCastSkillOn(sSkillBase, game.player.lockOn);
			game.auto.current.tickDelay = Date.now() + 100;
			return;
		}
	};
};
game.auto.onTickEvent.reaching = function(){
	if(!game.player.lockOn || game.player.lockOn.isDead){
		game.auto.setState("idle");
		return;
	}
	if(game.auto.Combat_isInRange()){
		game.auto.setState("combat");
		return;
	}
	if(!game.player.isWalking){
		game.setTarget(game.player.lockOn.x, game.player.lockOn.y);
		game.auto.current.tickDelay = Date.now() + 100;
	}
	
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
	if(game.auto.setting.fixedSite){
		//If fixed site and didn't found any entities, no need to spam the entity resreach, wait a bit for mobs to either respawn or move
		game.auto.current.tickDelay = Date.now() + 500;
	}
};
game.auto.Combat_isInRange = function(oEntity){
	let sSkillBase = game.player.classe + "_base";
	if(!game.player.skills[sSkillBase].inRange(game.player, ((oEntity)?oEntity:game.player.lockOn))){
		return false;
	}
	
	for(let i = 0; i < game.auto.slots.length; i++){
		let SkillID = game.auto.slots[i];
		let oSkill = game.player.skills[SkillID];
		let oProto = oSkill.proto;
		if(oProto.isPassive){
			continue;
		}
		if(!oProto.targetEnnemy){
			continue;
		}
		if(!oSkill.inRange(game.player, ((oEntity)?oEntity:game.player.lockOn))){
			return false;
		}
	};
	
	return true;
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
		if(o.skins.base.frames.hasOwnProperty("idle0")){
			this.skin.texture = o.skins.base.frames.idle0[0].sprite._texture.baseTexture.textureCacheIds[0];
			this.skin.frame.x = o.skins.base.frames.idle0[0].sprite._texture.frame.x;
			this.skin.frame.y = o.skins.base.frames.idle0[0].sprite._texture.frame.y;
			this.skin.frame.width = o.skins.base.frames.idle0[0].sprite._texture.frame.width;
			this.skin.frame.height = o.skins.base.frames.idle0[0].sprite._texture.frame.height;
		}else{
			
		}
		this.mid = o.mid;
		this.selected = true;
		this.level = o.level;
	}
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
	
	game.auto.onTick();
});


},5000);
})()