import { chromium } from 'patchright';
import fs from 'node:fs/promises';

const MAX_AGE_MS = 5 * 60_000;
const RESTART_DELAY_MS = 5_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function createPool(size, launchOptions) {
	const idle = [];
	const queue = []; // request backlog

	async function start(worker) {
		worker.generation++;

		const dir = `./profiles/${worker.label}g${worker.generation}`;
		await fs.rm(`./profiles/${worker.label}g${worker.generation - 1}`, { recursive: true, force: true });

		const context = await chromium.launchPersistentContext(
			dir,
			launchOptions(worker.label, worker.generation)
		);
		// crash detection
		context.once('close', () => { if (worker.context === context) worker.dead = true; });

		worker.context = context;
		worker.dead = false;
		worker.startedAt = Date.now();
		console.log(`[pool] ${worker.label}g${worker.generation} started at ${worker.startedAt}`);
	}

	async function restart(worker) {
		worker.dead = true;
		await worker.context?.close().catch(() => {});
		worker.context = null;
		while (true) {
			try {
				return await start(worker);
			} catch (err) {
				console.error(`[pool] ${worker.label}g${worker.generation} restart failed: ${err.message}`);
				await sleep(RESTART_DELAY_MS);
			}
		}
	}

	const stale = (worker) => worker.dead || Date.now() - worker.startedAt > MAX_AGE_MS;

	async function release(worker) {
		if (stale(worker))
			await restart(worker);
		const next = queue.shift();
		if (next)
			next(worker);
		else
			idle.push(worker);
	}


	for (let i = 1; i <= size; i++) {
		const worker = {
			label: `worker${i}`,
			context: null,
			generation: 0,
			dead: false,
			startedAt: 0,
		};
		await start(worker);
		idle.push(worker);
	}

	return {
		async run(task) {
			const worker = idle.shift() ?? await new Promise((r) => queue.push(r));
			if (stale(worker))
				await restart(worker);
			try {
				return await task(worker.context, worker.label);
			} finally {
				release(worker).catch((e) => console.error('[pool] worker release failed', e));
			}
		},
		close: () => Promise.all(idle.map((w) => w.context?.close().catch(() => {}))),
	};
}
