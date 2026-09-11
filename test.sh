#!/usr/bin/env sh

TEST_LINKS=test-links.txt

paste -d '' <(yes "http://localhost:6767/lowes?productUrl=" | head -n $(wc -l "$TEST_LINKS" | grep -oE '[0-9]*')) "$TEST_LINKS" |\
	xargs -L 4 -- curl
