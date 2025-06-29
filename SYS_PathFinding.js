game.path_finding = {};
game.path_finding.current = {
	"map": false,
	"isLoaded": false,
	"isLoading": false,
	"collisions": false,
};
// game.path_finding.enabled = false;
game.path_finding.enabled = game.cookie.get("PF-ENABLED", false);

game.auto.registerEvent("onAfter_playerChangeMap", "PathFinding", function(){
	if(!game.path_finding.enabled){
		return;
	}
	game.path_finding.current.map
});

game.path_finding.loadMapCollision = async function(sMap){
	if(!sMap){return;}
	if(game.path_finding.current.isLoading && game.path_finding.current.map === sMap){return;}
	if(game.path_finding.current.isLoading && game.path_finding.current.map !== sMap){
		setTimeout(() => {game.path_finding.loadMapCollision(sMap);}, 2_000);
		return;
	}if(game.path_finding.current.isLoaded && game.path_finding.current.map === sMap){
		//Already loaded
		return;
	}
	game.path_finding.current.map = sMap;
	game.path_finding.current.isLoading = true;
	game.path_finding.current.isLoaded = false;
	game.path_finding.current.collisions = false;
	let sPath = game.EXT_SOURCE_PATH + "maps/collisions/" + sMap + ".json";
	game.loadExternalJson(sPath) .then(data => {
		console.log("Contenu JSON chargé :", data);
		game.path_finding.current.collisions = data;
		game.path_finding.current.isLoading = false;
		game.path_finding.current.isLoaded = true;
	})
	.catch(error => {
		game.path_finding.current.isLoading = false;
		game.path_finding.current.isLoaded = true;
	});
}
