import { randomUUID } from "node:crypto";
import http from "node:http";

const database = [];

const server = http.createServer((req, res) => {
	const { method, url } = req;
	console.log(method, url);

	if (method === "GET" && url === "/tasks") {
		return res
			.setHeader("Content-type", "application/json")
			.end(JSON.stringify(database));
	}

	if (method === "POST" && url === "/tasks") {
		database.push({
			id: randomUUID(),
			title: "title test",
			description: "description test",
			completed_at: null,
			created_at: "2024-08-22",
			updated_at: "2024-08-22",
		});
		return res.end("Task criada com sucesso.");
	}

	res.end("Hello world");
});

server.listen(3000);
