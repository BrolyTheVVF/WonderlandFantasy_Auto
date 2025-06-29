game.auto.registerEvent("src_onAfter_buildInterface", "AutoSell", function(targetUid, oDamage, fromUid, newHealthPoint){
	$("#WF_STYLE").append($(''
		+ '<style id="WF_STYLE_AUTO_DEBUG_STYLESHEET">'
			//Stars
			+ '.ui-item-icon-star1{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star1.png\');}'
			+ '.ui-item-icon-star2{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star2.png\');}'
			+ '.ui-item-icon-star3{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star3.png\');}'
			+ '.ui-item-icon-star4{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star4.png\');}'
			+ '.ui-item-icon-star5{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star5.png\');}'
			+ '.ui-item-icon-star6{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star6.png\');}'
			+ '.ui-item-icon-star7{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star7.png\');}'
			+ '.ui-item-icon-star8{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star8.png\');}'
			+ '.ui-item-icon-star9{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star9.png\');}'
			+ '.ui-item-icon-star10{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star10.png\');}'
			+ '.ui-item-icon-star11{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star11.png\');}'
			+ '.ui-item-icon-star12{background-image: url(\'' + game.EXT_SOURCE_PATH + 'icon/misc/star12.png\');}'
		
			//Potions
			+ '#CHARACTERINFO_UI_MAIN .buff-slot-icon.buff-icon-HEALTH_REGEN{background-image: url(https://wonderland-fantasy.com/assets/original/icon/4001.png) !important;}'
			+ '#CHARACTERINFO_UI_MAIN .buff-slot-icon.buff-icon-MANA_REGEN{background-image: url(https://wonderland-fantasy.com/assets/original/icon/4002.png) !important;}'
		+ '</style>'
	));
});