import express from "express";
import { createPool } from "./pool.js";
import { scrapeLowes } from "./lowes.js";

process.loadEnvFile('.env')

const POOL_SIZE = Number(process.env.POOL_SIZE) || 1;
const PORT = Number(process.env.PORT) || 3000;

const rand = Math.random().toString(32).slice(2,10);
const pool = await createPool(POOL_SIZE, (label, generation) => ({
	channel: 'chrome',
	headless: false,
	viewport: null,
	args: [	'--ozone-platform=x11' ],
	proxy: {
		server: "http://proxy.mrscraper.com:10000",
		username: `${process.env.MRSCRAPER_USERNAME}-country-us-sessid-${label}g${generation}x${rand}-sesstime-10`,
		password: process.env.MRSCRAPER_PASSWORD,
	},
}));

const app = express();

app.get("/lowes", async (req, res) => {
	const { productUrl } = req.query;

	if (!productUrl) {
		return res.status(400).send('Missing required query param: productUrl\n');
	}

	try {
		res.type('html').send(await pool.run((ctx) => scrapeLowes(ctx, productUrl)));
	} catch (err) {
		console.error(`attempt limit exceeded: ${err.message}`);
		res.status(500).send(`${err.message}\n`);
	}
});

app.listen(PORT, () => console.log(`listening on 0.0.0.0 port ${PORT}`))
