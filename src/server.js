import express from "express";
import { getHtml } from "./lowes.js";

process.loadEnvFile('.env')
const app = express();

app.get("/lowes", async (req, res) => {
	const { productUrl } = req.query;

	if (!productUrl) {
		return res.status(400).send('Missing required query param: productUrl\n');
	}


	const html = await getHtml(productUrl);
	res.send(html);
});

app.listen(3000, () => console.log("listening on localhost port 3000"))
