#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { fetchExchangeRate } from "./lib/api/exchangeRate.js";
import { messageFromError } from "./lib/api/http.js";

export { fetchExchangeRate };

async function run() {
  try {
    const result = await fetchExchangeRate();
    console.log(`1 ${result.base} = ${result.rate} ${result.target}`);
    if (result.date) console.log(`Rate date: ${result.date}`);
  } catch (error) {
    console.error(
      `Exchange-rate lookup failed: ${messageFromError(error, "Unknown error")}`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
