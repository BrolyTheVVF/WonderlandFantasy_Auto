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
	if(!game.auto.visible || !game.player || !game.scenes.list.main.scene.visible){
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

game.auto.refreshUI_Gears = function(){
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



$(document).ready(() => {
	game.UI.list.push(game.auto);
	locale["UI.windows.auto.title"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
	locale["UI.windows.auto.tab.auto"] = {"en": "Auto-pilot", "fr": "Pilote automatique"};
	locale["UI.windows.auto.tab.settings"] = {"en": "Settings", "fr": "Paramètres"};
	locale["UI.windows.auto.tab.monsters"] = {"en": "Monsters", "fr": "Monstres"};
	
});


},5000);
})()