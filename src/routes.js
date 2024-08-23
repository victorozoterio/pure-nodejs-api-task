import { randomUUID } from "node:crypto";

const database = [];

export const routes = [
	{
		method: "GET",
		path: "/tasks",
		handler: (req, res) => {
			return res.end(JSON.stringify(database));
		},
	},
	{
		method: "POST",
		path: "/tasks",
		handler: (req, res) => {
			const { title, description } = req.body;

			database.push({
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: new Date(),
				updated_at: new Date(),
			});

			return res
				.writeHead(201)
				.end(JSON.stringify(database[database.length - 1]));
		},
	},
];
