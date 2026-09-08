import test from "node:test";
import assert from "node:assert/strict";
import {
  EXCHANGE_RATE_ENDPOINT,
  fetchExchangeRate,
  normalizeExchangeRate,
} from "../lib/api/exchangeRate.js";

test("normalizes a valid NGN to USD response", () => {
  assert.deepEqual(
    normalizeExchangeRate({ base: "NGN", date: "2026-09-08", rates: { USD: 0.00066 } }),
    { base: "NGN", target: "USD", rate: 0.00066, date: "2026-09-08" },
  );
});

test("rejects invalid rate payloads", () => {
  assert.throws(
    () => normalizeExchangeRate({ rates: { USD: null } }),
    /invalid NGN to USD rate/i,
  );
});

test("keeps the specified endpoint and appends an optional key", async () => {
  let requestedUrl;
  const fetchImpl = async (url) => {
    requestedUrl = url;
    return new Response(JSON.stringify({ base: "NGN", rates: { USD: 0.00066 } }));
  };

  await fetchExchangeRate({ apiKey: "example-key", fetchImpl });

  assert.equal(requestedUrl.origin + requestedUrl.pathname, new URL(EXCHANGE_RATE_ENDPOINT).origin + new URL(EXCHANGE_RATE_ENDPOINT).pathname);
  assert.equal(requestedUrl.searchParams.get("base"), "NGN");
  assert.equal(requestedUrl.searchParams.get("symbols"), "USD");
  assert.equal(requestedUrl.searchParams.get("access_key"), "example-key");
});

test("surfaces provider errors", async () => {
  const fetchImpl = async () =>
    new Response(
      JSON.stringify({ success: false, error: { info: "missing access key" } }),
    );

  await assert.rejects(fetchExchangeRate({ fetchImpl }), /missing access key/i);
});
