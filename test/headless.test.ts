import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

test("headless login accepts a pasted redirect URL or query string", () => {
	const { parsePastedRedirect, isHeadless } = require("../scripts/common.js");
	const callback = "http://localhost:4321/oauth2callback";
	assert.equal(parsePastedRedirect(`${callback}?state=s&code=c`, callback).get("code"), "c");
	assert.equal(parsePastedRedirect("state=s&code=c2", callback).get("code"), "c2");
	assert.throws(() => parsePastedRedirect(" ", callback), /No redirect URL/);
	assert.equal(isHeadless({ noBrowser: true }), true);
});
