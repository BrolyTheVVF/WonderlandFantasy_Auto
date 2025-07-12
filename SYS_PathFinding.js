game.path_finding = {};
game.path_finding.current = {
	"collisions": {
		"map": false,
		"data": false,
		"isLoaded": false,
		"isLoading": false,
	},
	"walk_points": {
		"map": false,
		"data": false,
		"isLoaded": false,
		"isLoading": false,
	},
	"worker": {
		"map": false,
		"isLoaded": false,
		"isLoading": false,
		"isError": false,
		"isSearching": false,
	},
	"firstLoad": false,
};
// game.path_finding.enabled = false;
game.path_finding.enabled = game.cookie.get("PF-ENABLED", false);
game.path_finding.setEnabled = function(bEnabled){
	game.path_finding.enabled = bEnabled;
	game.cookie.set("PF-ENABLED", bEnabled);
	if(bEnabled){
		game.path_finding.onMapChange();
	}
};
// game.path_finding.worker = new SharedWorker(game.EXT_SOURCE_PATH + 'WORKER_PathFinding.js?v=' + game.auto.version);
// game.path_finding.worker = new Worker(game.EXT_SOURCE_PATH + 'WORKER_PathFinding.js?v=' + game.auto.version);
// const WORKER_URL = new URL(game.EXT_SOURCE_PATH + 'WORKER_PathFinding.js?v=' + game.auto.version, import.meta.url);
// const WORKER_BLOB = new Blob([`import "${ WORKER_URL }"`], { type: 'text/javascript' });
// const WORKER_BLOB_URL = window.URL.createObjectURL(WORKER_BLOB);
// game.path_finding.worker = new Worker(WORKER_BLOB_URL, { type: 'module' });
game.path_finding.worker = ((workerUrl) => {
    const blob = new Blob([`importScripts('${workerUrl}');`], {'type': 'application/javascript'});
    return new Worker(URL.createObjectURL(blob));
})(game.EXT_SOURCE_PATH + 'WORKER_PathFinding.js?v=' + game.auto.version);


game.auto.registerEvent("onAfter_playerChangeMap", "PathFinding", async function(){
	game.path_finding.onMapChange();
});
game.auto.registerEvent("onTick", "PathFinding", async function(){
	if(game.path_finding.current.firstLoad){
		return;
	}
	game.path_finding.current.firstLoad = true;
	game.path_finding.onMapChange();
});


game.path_finding.onMapChange = async function(){
	if(!game.path_finding.enabled){
		return;
	}
	await game.path_finding.loadMapCollision(game.player.map);
	await game.path_finding.loadMapWalkPoints(game.player.map);
	
	game.path_finding.current.worker.isLoaded = false;
	game.path_finding.current.worker.isError = false;
	game.path_finding.init_worker();
	// console.log(game.path_finding.current);
};

game.path_finding.Collision_convert = function(obst){
	o = [];
	for(let i = 0; i < obst.length; i++){
		let p = [];
		for(let j = 0; j < obst[i].length; j++){
			p.push({"x": obst[i][j][0], "y": obst[i][j][1]});
		}
		o.push(p);
	}
	return o;
}

game.path_finding.loadMapCollision = async function(sMap){
	if(!sMap){return;}
	if(game.path_finding.current.collisions.isLoading && game.path_finding.current.collisions.map === sMap){return;}
	if(game.path_finding.current.collisions.isLoading && game.path_finding.current.collisions.map !== sMap){
		setTimeout(() => {game.path_finding.loadMapCollision(sMap);}, 2_000);
		return;
	}if(game.path_finding.current.collisions.isLoaded && game.path_finding.current.collisions.map === sMap){
		//Already loaded
		return;
	}
	game.path_finding.current.collisions.map = sMap;
	game.path_finding.current.collisions.isLoading = true;
	game.path_finding.current.collisions.isLoaded = false;
	game.path_finding.current.collisions.data = false;
	let sPath = game.EXT_SOURCE_PATH + "maps/collisions/" + sMap + ".json";
	game.loadExternalJson(sPath).then(data => {
		// console.log("Contenu JSON chargé :", data);
		if(Array.isArray(data) && data[0] && Array.isArray(data[0])){
			data = game.path_finding.Collision_convert(data);
		}
		game.path_finding.current.collisions.data = data;
		game.path_finding.current.collisions.isLoading = false;
		game.path_finding.current.collisions.isLoaded = true;
	})
	.catch(error => {
		console.error("Echech du chargement du JSON :", error);
		game.path_finding.current.collisions.isLoading = false;
		game.path_finding.current.collisions.isLoaded = true;
	});
};

game.path_finding.loadMapWalkPoints = async function(sMap){
	if(!sMap){return;}
	if(game.path_finding.current.walk_points.isLoading && game.path_finding.current.walk_points.map === sMap){return;}
	if(game.path_finding.current.walk_points.isLoading && game.path_finding.current.walk_points.map !== sMap){
		setTimeout(() => {game.path_finding.loadMapCollision(sMap);}, 2_000);
		return;
	}if(game.path_finding.current.walk_points.isLoaded && game.path_finding.current.walk_points.map === sMap){
		//Already loaded
		return;
	}
	game.path_finding.current.walk_points.map = sMap;
	game.path_finding.current.walk_points.isLoading = true;
	game.path_finding.current.walk_points.isLoaded = false;
	game.path_finding.current.walk_points.data = false;
	let sPath = game.EXT_SOURCE_PATH + "maps/walk_points/" + sMap + ".json";
	game.loadExternalJson(sPath).then(data => {
		// console.log("Contenu JSON chargé :", data);
		game.path_finding.current.walk_points.data = data;
		game.path_finding.current.walk_points.isLoading = false;
		game.path_finding.current.walk_points.isLoaded = true;
	})
	.catch(error => {
		console.error("Echech du chargement du JSON :", error);
		game.path_finding.current.walk_points.isLoading = false;
		game.path_finding.current.walk_points.isLoaded = true;
	});
};

game.path_finding.onInitDone = function(){};
game.path_finding.init_worker = function(){
	return new Promise((resolve, reject) => {
		if(game.path_finding.current.collisions.isLoading){return;}
		if(game.path_finding.current.walk_points.isLoading){return;}
		if(game.path_finding.current.collisions.map !== game.player.map){return;}
		if(game.path_finding.current.walk_points.map !== game.player.map){return;}
		
		if(game.path_finding.current.worker.map === game.player.map){return;}
		
		if(game.path_finding.current.worker.isLoading){return;}
		
		if(!game.path_finding.current.collisions.data || !game.path_finding.current.walk_points.data){
			game.path_finding.current.worker.isError = true;
			return;
		}
		
		// worker.postMessage({
			// type: 'findPath',
			// data: {
				// 'start': start,
				// 'end': end,
			// }
		// });
		game.path_finding.onInitDone = () => {
			resolve();
		};
		game.path_finding.current.worker.map = game.player.map;
		game.path_finding.worker.postMessage({ 'type': 'init', 'data': { 'points': game.path_finding.current.walk_points.data, 'obstacles': game.path_finding.current.collisions.data } });
	});
};
game.path_finding.find_path = function(oFrom, oTo){
	return new Promise(async (resolve, reject) => {
		game.path_finding.current.worker.isSearching = true;
		
		if(game.path_finding.current.worker.map !== game.player.map){
			await game.path_finding.init_worker();
		}
		// let CALL_ID = game.mmrand(1000000,9999999);
		let CALL_ID = 111111;
		
		game.path_finding.onWorkerDone[CALL_ID] = (oPath) => {
			// console.log("Worker done, path:", oPath);
			game.path_finding.current.worker.isSearching = false;
			resolve(oPath);
		};
		game.path_finding.worker.postMessage({
			'type': 'findPath',
			'data': {
				'start': oFrom,
				'end': oTo,
			},
			'CALL_ID': CALL_ID
		});
	});
};

game.path_finding.onWorkerDone = {};
game.path_finding.worker.onmessage = function (e) {
	// const { type, path, CALL_ID } = e.data;
	const { type, path } = e.data;
	let CALL_ID = 111111;
	
	// console.log("game.path_finding.worker.onmessage", type, path, CALL_ID);
	if (type === 'ready') {
		console.log('Graphe prêt !');
		game.path_finding.current.worker.isLoading = false;
		game.path_finding.current.worker.isLoaded = true;
		game.path_finding.onInitDone();
	} else if (type === 'result') {
		console.log('Chemin trouvé :');
		console.log(JSON.stringify(path));
		
		if(game.path_finding.onWorkerDone.hasOwnProperty(CALL_ID)){
			if(typeof game.path_finding.onWorkerDone[CALL_ID] == "function"){
				game.path_finding.onWorkerDone[CALL_ID](path);
			}
			delete game.path_finding.onWorkerDone[CALL_ID];
		}
	}
};


