# Lowes Scraper

This program scrapes Lowes product detail pages (PDPs).

## Requirements

- node.js
- npm
- Google Chrome
- [X virtual framebuffer (Xvfb)](https://en.wikipedia.org/wiki/Xvfb)
- Access to [Mr. Scraper proxies](https://mrscraper.com/)

## Setup

TODO

Copy `example.env` to `.env` and fill out the Mr. Scraper proxy username and password.

## Running

## Strategies

I used [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright),
which is a patched version of
[Playwright](https://playwright.dev/)
that avoids detection by
[Akamai Bot Manager](https://www.akamai.com/products/bot-manager).
To be completely undetected requires
running Google Chrome within a graphical environment,
which is why I used Xvfb so that I can run Google Chrome on a headless server.

## Examples
