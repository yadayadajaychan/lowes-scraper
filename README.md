# Lowes Scraper

This program scrapes Lowes product detail pages (PDPs).

## Requirements

- [node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Make](https://en.wikipedia.org/wiki/Make_(software))
- [Google Chrome](https://www.google.com/chrome/)
- [X virtual framebuffer (Xvfb)](https://en.wikipedia.org/wiki/Xvfb)
- Access to [Mr. Scraper proxies](https://mrscraper.com/)

## Setup

Run `npm install`.

Copy `example.env` to `.env` and fill out the Mr. Scraper proxy username and password,
as well as the worker pool size and the TCP port for the API to listen on.

## Running

Run `make run` in the project directory.

## Strategies

To scrape the PDP,
I used [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright),
which is a patched version of
[Playwright](https://playwright.dev/)
that avoids detection by
[Akamai Bot Manager](https://www.akamai.com/products/bot-manager).
To be completely undetected requires
running Google Chrome within a graphical environment,
which is why I used Xvfb so that I can run Google Chrome on a headless server.

The REST API has one route, `/lowes`, that takes `productUrl` as a parameter and
returns the client-side rendered HTML from the PDP.
Each request is sent to the worker pool to be fulfilled.

Each worker has a different browser context and IP address.
If a worker fails to fulfill the request, the worker is restarted and the request is retried by another worker.
When a worker is restarted, it gains a fresh browser context and new IP address.
Workers expire after 5 minutes and are restarted.
Idle workers are in an LRU queue, where the least recently used worker fulfills the next request.
If there are no idle workers, the request is queued and will be fulfilled by the next available worker.

## API Example

```
GET https://example.com/lowes?productUrl=https://www.lowes.com/pd/Klein-Tools-Pass-Thru-Modular-Data-Plugs-RJ45-CAT6-10-Pack/5014306007
```
