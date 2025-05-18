// ==UserScript==
// @name         WF Auto Pilot
// @namespace    http://tampermonkey.net/
// @version      2025-05-18.002
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
	"active": false,
	"state": "idle",
	"tickDelay": 0,
};
game.auto.slots = {
	"skills": [false, false, false, false, false, false],
	"items": [false, false, false, false, false, false],
};

game.auto.buildInterface = function(){
	/** QUESTS LIST WINDOW UI **/
	game.auto.HTML = HTML_UI_BuildWindow("AUTO_UI_MAIN", {"x": game.cookie.get("AUTO_UI_MAIN-pos.x", 20), "y": game.cookie.get("AUTO_UI_MAIN-pos.y", 10), "width": 600, "height": 390, "title": LC_TEXT("UI.windows.auto.title")}, function(){game.auto.hide();});
	let contentFrame = $(''
		+'<div style="margin-top: 6px;display: grid;grid-template-rows: auto 1fr;">'
			+'<div>'
				+ '<div class="ui-tab">'
					+ '<div class="ui-tab-option active" data-tab-target="#AUTO_UI_TAB1">' + LC_TEXT('UI.windows.auto.tab.auto') + '</div>'
					+ '<div class="ui-tab-option" data-tab-target="#AUTO_UI_TAB2">' + LC_TEXT('UI.windows.auto.tab.settings') + '</div>'
					+ '<div class="ui-tab-option" data-tab-target="#AUTO_UI_TAB4">' + LC_TEXT('UI.windows.auto.tab.monsters') + '</div>'
				+ '</div>'
				+ '<div class="ui-tab-line"></div>'
			+'</div>'
			+ '<div class="auto-pane ui-tab-content-row">'
				// TAB 1
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB1" style="overflow: hidden;">'
					
				+ '</div>'
				// TAB 2
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB2" style="display: none;">'
					
				+ '</div>'
				// TAB 3
				+ '<div class="ui-tab-content" id="AUTO_UI_TAB3" style="display: none;">'
					
			+'</div>'
		+'</div>'
	+'</div>'
	);
	
	$(game.auto.HTML).find(".ui-body-content").append(contentFrame);
	$("#UI_MAIN").append(game.auto.HTML);
	
	$(".minimap-radar-btn-auto").parent().append('<div class="minimap-radar-btn-realauto" title="DPS Meter" onclick="game.auto.toggleVisible();" style="position: absolute;top:50px;right: 50px;background-image: url(' + game.assets.baseURL + 'ui/button/10_1.png);width: 29px;height: 28px;"></div>');
	
	$("#WF_STYLE").append($(''
		+ '<style id="WF_STYLE_CHARACTER_MAIN">'
		
		/** CHARACTER UI - CHECK GEAR **/
		+ '#AUTO_UI_LEFT .character-gear-line, #CHECKGEAR_UI_MAIN .character-gear-line {margin-left: 5px;margin-right: 5px;}'
		+ '#AUTO_UI_RIGHT .stat-pane{flex-grow: 1;height: auto;overflow-y: auto;padding: 5px;margin-top: 5px;background-color: #' + game.UI.COLORS.uiBGLight2 + ';}'
		+ '#AUTO_UI_TAB1{padding-top: 10px;}'
		
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
	game.auto.refreshUI_Gears();
	
	
	$("#AUTO_UI_MAIN").show();
};

game.auto.refreshUI_Lang = function(){
	$("#AUTO_UI_MAIN .ui-title").html(LC_TEXT("UI.windows.auto.title"));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB1']").html(LC_TEXT('UI.windows.auto.tab.auto'));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB2']").html(LC_TEXT('UI.windows.auto.tab.settings'));
	$("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB3']").html(LC_TEXT('UI.windows.auto.tab.monsters'));
	// $("#AUTO_UI_MAIN [data-tab-target='#AUTO_UI_TAB4']").html(LC_TEXT('UI.windows.auto.tab.element'));
	// $("#AUTO_UI_MAIN #character-window-stat-HP-label").html(LC_TEXT("UI.stat.HP") + ": ");
	// $("#AUTO_UI_MAIN #character-window-stat-Guild-label").html(LC_TEXT("general.guild") + ": ");
	// $("#AUTO_UI_MAIN #character-window-stat-MP-label").html(LC_TEXT("UI.stat.MP") + ": ");
	// $("#AUTO_UI_MAIN #character-window-stat-SPD-label").html(LC_TEXT("UI.stat.SPD") + ": ");
	// $("#AUTO_UI_MAIN #character-window-stat-EXP-label").html(LC_TEXT("UI.stat.EXP") + ": ");
	// $("#AUTO_UI_MAIN #character-window-stat-ATK-label").html(LC_TEXT("UI.stat.ATK.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-DEF-label").html(LC_TEXT("UI.stat.DEF.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-ENHC_DMG-label").html(LC_TEXT("UI.stat.ENHC_DMG.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-DMG_RD-label").html(LC_TEXT("UI.stat.DMG_RD.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-ATK_SPD-label").html(LC_TEXT("UI.stat.ATK_SPD.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_ENHC-label").html(LC_TEXT("UI.stat.SKILL_ENHC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-ACC-label").html(LC_TEXT("UI.stat.ACC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_ACC-label").html(LC_TEXT("UI.stat.SKILL_ACC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-EVA-label").html(LC_TEXT("UI.stat.EVA.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_EVA-label").html(LC_TEXT("UI.stat.SKILL_EVA.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-CRIT_ACC-label").html(LC_TEXT("UI.stat.CRIT_ACC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_CRIT_ACC-label").html(LC_TEXT("UI.stat.SKILL_CRIT_ACC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-CRIT_EVA-label").html(LC_TEXT("UI.stat.CRIT_EVA.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_CRIT_EVA-label").html(LC_TEXT("UI.stat.SKILL_CRIT_EVA.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-CRIT_ENHC-label").html(LC_TEXT("UI.stat.CRIT_ENHC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_CRIT_ENHC-label").html(LC_TEXT("UI.stat.SKILL_CRIT_ENHC.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-CRIT_RD-label").html(LC_TEXT("UI.stat.CRIT_RD.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-SKILL_CRIT_RD-label").html(LC_TEXT("UI.stat.SKILL_CRIT_RD.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-HOLY_ATK-label").html(LC_TEXT("UI.stat.HOLY_ATK.short"));
	// $("#AUTO_UI_MAIN #character-window-stat-LUCK-label").html(LC_TEXT("UI.stat.LUCK.short"));
};

game.auto.refreshUI_Npcs = function(){
	let oChar = game.player;
	if(oChar === false){ return; }
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
	let oClosest = game.utilities.getClosestEntity();
	if(oClosest){
		game.setLockON(oClosest.uid, true, "auto");
		game.auto.setState("combat");
	}
};
game.auto.onTickEvent.combat = function(){
	if(!game.player.lockOn || game.player.lockOn.isDead){
		game.auto.setState("idle");
		return;
	}
	if(!game.auto.Combat_isInRange()){
		game.auto.setState("reaching");
		return;
	}
	let sSkillBase = game.player.classe + "_base";
	let oSkillBase = game.player.skills[sSkillBase];
	if(oSkillbase.isReady(game.player)){
		game.player.askCastSkillOn(sSkillBase, game.player.lockOn);
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

game.auto.Combat_isInRange = function(){
	let sSkillBase = game.player.classe + "_base";
	if(!game.player.skills[sSkillBase].inRange(game.player, game.player.lockOn)){
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
		if(!oSkill.inRange(game.player, game.player.lockOn)){
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
		this.skinTexture = false;
		if(o.skins.base.frames.hasOwnProperty("idle0")){
			this.skinTexture = o.skins.base.frames.idle0[0].sprite._texture.baseTexture.textureCacheIds[0];
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
	
	game.auto.onTick();
});


},5000);
})()