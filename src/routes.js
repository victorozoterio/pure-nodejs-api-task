import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
	{
		method: "GET",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const tasks = database.select("tasks");
			return res.end(JSON.stringify(tasks));
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { title, description } = req.body;

			const task = {
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: new Date(),
				updated_at: new Date(),
			};

			database.insert("tasks", task);

			return res.writeHead(201).end(JSON.stringify(task));
		},
	},
	{
		method: "PUT",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;
			const { title, description } = req.body;

			try {
				const updatedTask = database.update("tasks", id, {
					title: title,
					description: description,
					updated_at: new Date(),
				});

				return res.end(JSON.stringify(updatedTask));
			} catch (error) {
				if (error.message === "404: Not Found") {
					return res
						.writeHead(404)
						.end(JSON.stringify({ message: "Task does not exist." }));
				}
			}
		},
	},
	{
		method: "DELETE",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;

			try {
				database.delete("tasks", id);
				return res.writeHead(204).end();
			} catch (error) {
				if (error.message === "404: Not Found") {
					return res
						.writeHead(404)
						.end(JSON.stringify({ message: "Task does not exist." }));
				}
			}
		},
	},
];
