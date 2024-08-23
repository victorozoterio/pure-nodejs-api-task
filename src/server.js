import http from "node:http";
import { jsonParser } from "./middlewares/json-parser.js";
import { routes } from "./routes.js";

const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	await jsonParser(req, res);

	const route = routes.find((route) => {
		return route.method === method && route.path.test(url);
	});

	if (route) {
		const routeParams = req.url.match(route.path);
		req.params = { ...routeParams.groups };

		return route.handler(req, res);
	}

	return res.writeHead(404).end();
});

server.listen(3000);
