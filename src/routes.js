import multer from "multer";
import csv from "csv-parser";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const upload = multer({ dest: "./" });

const database = new Database();

export const routes = [
	{
		method: "POST",
		path: buildRoutePath("/tasks/csv"),
		handler: (req, res) => {
			upload.single("file")(req, res, () => {
				const file = req.file;

				if (!file) {
					return res
						.writeHead(400)
						.end(JSON.stringify({ message: "CSV file must be sent." }));
				}

				const tasks = [];

				fs.createReadStream(file.path)
					.pipe(csv({ headers: ["title", "description"], skipLines: 1 }))
					.on("data", (row) => {
						const { title, description } = row;

						if (!title || !description) {
							fs.unlinkSync(file.path);
							return res.writeHead(400).end(
								JSON.stringify({
									message: "CSV must contain title and description.",
								}),
							);
						}

						const task = {
							id: randomUUID(),
							title,
							description,
							completed_at: null,
							created_at: new Date(),
							updated_at: new Date(),
						};

						tasks.push(task);
						database.insert("tasks", task);
					})
					.on("end", () => {
						fs.unlinkSync(file.path);
						return res.writeHead(201).end(JSON.stringify(tasks));
					});
			});
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { title, description } = req.body;

			if (!title || !description) {
				return res
					.writeHead(400)
					.end(
						JSON.stringify({ message: "title and description must be sent." }),
					);
			}

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
		method: "GET",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const tasks = database.select("tasks");
			return res.end(JSON.stringify(tasks));
		},
	},
	{
		method: "PUT",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;
			const { title, description } = req.body;

			if (!title || !description) {
				return res
					.writeHead(400)
					.end(
						JSON.stringify({ message: "title and description must be sent." }),
					);
			}

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
		method: "PATCH",
		path: buildRoutePath("/tasks/:id/complete"),
		handler: (req, res) => {
			const { id } = req.params;

			try {
				const tasks = database.select("tasks");
				const task = tasks.find((task) => task.id === id);

				if (task.completed_at !== null) {
					return res
						.writeHead(400)
						.end(JSON.stringify({ message: "Task is already completed." }));
				}

				const updatedTask = database.update("tasks", id, {
					completed_at: new Date(),
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
