import { chromium } from 'patchright';

export async function scrapeLowes(context, url) {
	const page = await context.newPage();

	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
		await page.locator('span[class="item-price-dollar"]').first()
			.waitFor({ timeout: 10_000 })
			.catch(() => console.warn('[warn] price never appeared'));

		const html = await page.content();
		return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
	} finally {
		await page.close().catch(() => {});
	}
}


export async function getHtml(url) {
	const context = await chromium.launchPersistentContext('./profile', {
		channel: 'chrome',
		headless: false,
		viewport: null,
		args: [	'--ozone-platform=x11' ],
		proxy: {
			server: "http://proxy.mrscraper.com:10000",
			username: `${process.env.MRSCRAPER_USERNAME}-country-us-sessid-worker1-sesstime-10`,
			password: process.env.MRSCRAPER_PASSWORD,
		},

	});

	try {
		const page = await context.newPage();

		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });

		try {
			await page.locator('span[class="item-price-dollar"]').first().waitFor({ timeout: 10_000 });
		} catch {
			console.warn('[warn] price never appeared')
		}

		const html = await page.content();

		// Kill the JS so the snapshot stays frozen
		const frozen = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
		console.log(frozen);

		return frozen;
	} finally {
		await context.close();
	}
}


//const testUrl = 'https://www.lowes.com/pd/Holland-Red-Charcoal-Concrete-Paver-Common-8-in-x-4-in-Actual-7-75-in-x-3-88-in/3010214'
//const testUrl = 'https://www.lowes.com/pd/DEWALT-20V-MAX-XR-Brushless-4-Tool-Combo-Kit-with-POWERSTACK-Compact-Battery-5-0Ah-Battery-Charger-and-Tool-Bag/5013264073'
//const testUrl = 'https://ip.nijika.org'

