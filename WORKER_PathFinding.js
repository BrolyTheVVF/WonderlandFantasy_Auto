/* global SAT */

importScripts('https://cdn.jsdelivr.net/npm/sat@0.9.0/SAT.min.js');

let visibilityGraph = {};
let points = [];
let obstacles = [];

// Test si un segment intersecte un polygone convexe
function segmentIntersectsPolygon(p1, p2, polygon) {
    const line = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(p1.x, p1.y),
        new SAT.Vector(p2.x, p2.y)
    ]);

    const poly = new SAT.Polygon(new SAT.Vector(), polygon.map(pt => new SAT.Vector(pt.x, pt.y)));

    for (let i = 0; i < poly.calcPoints.length; i++) {
        const a = poly.calcPoints[i];
        const b = poly.calcPoints[(i + 1) % poly.calcPoints.length];

        const edge = new SAT.Polygon(new SAT.Vector(), [
            a.clone(), b.clone()
        ]);

        if (SAT.testPolygonPolygon(line, edge)) {
            return true;
        }
    }

    return SAT.testPolygonPolygon(line, poly);
}

// Vérifie si deux points sont en ligne de vue
function isLineOfSight(p1, p2) {
    for (let zone of obstacles) {
        if (segmentIntersectsPolygon(p1, p2, zone)) {
            return false;
        }
    }
    return true;
}

// Génère le graphe de visibilité
function buildVisibilityGraph() {
    visibilityGraph = {};
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        visibilityGraph[i] = [];
        for (let j = 0; j < points.length; j++) {
            if (i === j) continue;
            const b = points[j];
            if (isLineOfSight(a, b)) {
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                visibilityGraph[i].push({ target: j, distance: dist });
            }
        }
    }
}

// Recherche les voisins visibles d'un point (pas un nœud du graphe)
function getVisiblePoints(point) {
    const visible = [];
    for (let i = 0; i < points.length; i++) {
        if (isLineOfSight(point, points[i])) {
            const dist = Math.hypot(point.x - points[i].x, point.y - points[i].y);
            visible.push({ index: i, distance: dist });
        }
    }
    return visible;
}

// Algorithme de Dijkstra
function dijkstra(start, end) {
    const dist = {};
    const prev = {};
    const visited = new Set();
    const queue = new Set(Object.keys(visibilityGraph));

    for (let node of queue) {
        dist[node] = Infinity;
        prev[node] = null;
    }

    dist[start] = 0;

    while (queue.size) {
        let u = [...queue].reduce((minNode, node) =>
            dist[node] < dist[minNode] ? node : minNode
        );

        if (u === end.toString()) break;
        queue.delete(u);
        visited.add(u);

        for (let neighbor of visibilityGraph[u]) {
            if (visited.has(neighbor.target.toString())) continue;

            const alt = dist[u] + neighbor.distance;
            if (alt < dist[neighbor.target]) {
                dist[neighbor.target] = alt;
                prev[neighbor.target] = u;
            }
        }
    }

    const path = [];
    let u = end.toString();
    while (u !== null) {
        path.unshift(parseInt(u));
        u = prev[u];
    }

    return path.length > 1 ? path : null;
}

// Réception des messages du main thread
onmessage = function (e) {
    const { type, data, CALL_ID } = e.data;
	// console.log("onmessage", type, data, CALL_ID);
	
    if (type === 'init') {
        points = data.points;
        obstacles = data.obstacles;
		if(!points || !obstacles){
			// postMessage({ type: 'init_failed' });
			return;
		}
        buildVisibilityGraph();
        postMessage({ type: 'ready' });

    } else if (type === 'findPath') {
        const { start, end } = data;

		if(isLineOfSight(start, end)){
			postMessage({ type: 'result', path: [end] });
			return;
		}

        const startVisible = getVisiblePoints(start);
        const endVisible = getVisiblePoints(end);

        if (startVisible.length === 0 || endVisible.length === 0) {
            postMessage({ type: 'result', path: null });
            return;
        }

        let bestPath = null;
        let bestCost = Infinity;

        for (let s of startVisible) {
            for (let e of endVisible) {
                const path = dijkstra(s.index, e.index);
                if (path) {
                    const cost = s.distance + path.reduce((acc, cur, idx) => {
                        if (idx === 0) return acc;
                        const prev = path[idx - 1];
                        const edge = visibilityGraph[prev].find(e => e.target === cur);
                        return acc + (edge ? edge.distance : Infinity);
                    }, 0) + e.distance;

                    if (cost < bestCost) {
                        bestCost = cost;
                        bestPath = [start, ...path.map(i => points[i]), end];
                    }
                }
            }
        }
		// console.log("onmessage.postMessage", 'result', bestPath, CALL_ID);
        postMessage({ 'type': 'result', 'path': bestPath, 'CALL_ID': CALL_ID });
    }
};
