import test from "node:test";
import assert from "node:assert/strict";
import {
  extractCurrency,
  normalizeWordPressContent,
} from "../lib/api/wordpress.js";

test("orders posts newest first and keeps site settings", () => {
  const result = normalizeWordPressContent({
    generalSettings: { title: "Bema", description: "Headless test" },
    posts: {
      nodes: [
        { id: "1", title: "Older", date: "2026-09-01T10:00:00Z" },
        { id: "2", title: "Newest", date: "2026-09-08T10:00:00Z" },
      ],
    },
  });

  assert.equal(result.posts[0].title, "Newest");
  assert.equal(result.settings.title, "Bema");
});

test("supports the EDD compatibility response", () => {
  assert.equal(extractCurrency({ currency: "ngn" }), "NGN");
});

test("rejects invalid WordPress and EDD responses", () => {
  assert.throws(() => normalizeWordPressContent({}), /invalid posts collection/i);
  assert.throws(() => extractCurrency({ currency: "naira" }), /invalid currency/i);
});
