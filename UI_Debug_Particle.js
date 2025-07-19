Particle.animations["1172_default"] = {
	"loop": true,
	"frames": [{
			"path": "effects/1172_default/0.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.5,
			}
		}, {
			"path": "effects/1172_default/1.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.55,
			}
		}, {
			"path": "effects/1172_default/2.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.6,
			}
		}, {
			"path": "effects/1172_default/3.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.55,
			}
		}, {
			"path": "effects/1172_default/4.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.5,
			}
		}, {
			"path": "effects/1172_default/5.png",
			"speed": 4,
			"anchor": {
				"x": 0.5,
				"y": 0.45,
			}
		}
	]
};
Particle.proto["MN_AUTO_MODE"] = {
	"list": [
		{"offset_x": 0, "offset_y": -120, "animation": "1172_default"}
	],
	"type": "sticky",
	"layer": "mainfg",
};

buff.__proto["B_MN_AUTO_MODE"] = {
	// "icon": "../bout1",
	"icon": "../s00000",
	"particles": ["MN_AUTO_MODE"],
	"defaultDuration": 365 * nTimeDay
};

let MN_AnimsToLoad = ["1172_default"];
let MN_FramesToLoad = [];
for(j = 0; j< MN_AnimsToLoad.length; j++){
	let k = MN_AnimsToLoad[j];
	for(let i = 0; i < Particle.animations[k].frames.length; i++){
		let sRes = game.baseUrl + "assets/textures/animations/" + Particle.animations[k].frames[i].path;
		if(!Assets.cache.has(sRes) && game.assetToLoad.indexOf(sRes) < 0){
			MN_FramesToLoad.push(sRes);
		}
	}
}
game.load.add(MN_FramesToLoad,() => {
	if(game.IS_PTR){console.log("MN_FramesToLoad -> LOADED");}
});