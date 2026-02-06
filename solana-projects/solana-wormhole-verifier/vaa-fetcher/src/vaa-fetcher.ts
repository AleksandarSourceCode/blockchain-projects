import {
  WORMHOLESCAN_BASE_URL,
  WORMHOLE_CHAIN_ID_ETHEREUM_SEPOLIA,
  EMITTER_ADDRESS,
  INITIAL_SEQUENCE,
  SLEEP_MS,
} from "./config/constants.js";

import { fetchVaa } from "./wormhole/fetchVaa.js";
import { saveJson } from "./utils/saveJson.js";
import { loadSequence, saveSequence } from "./utils/sequenceStore.js";
import { sleep } from "./utils/sleep.js";

const MAX_FETCHES = process.env.MAX_FETCHES
  ? Number(process.env.MAX_FETCHES)
  : undefined;

async function main(): Promise<void> {
  let sequence = await loadSequence(INITIAL_SEQUENCE);
  let fetched = 0;

  console.log(`▶️ Starting VAA fetcher at sequence ${sequence}`);

  while (true) {
    try {
      if (MAX_FETCHES && fetched >= MAX_FETCHES) {
        console.log(`🏁 Reached MAX_FETCHES=${MAX_FETCHES}, exiting`);
        return;
      }
      console.log(`🔎 Fetching VAA sequence=${sequence}`);

      const vaaRaw = await fetchVaa(
        WORMHOLESCAN_BASE_URL,
        WORMHOLE_CHAIN_ID_ETHEREUM_SEPOLIA,
        EMITTER_ADDRESS,
        sequence,
      );

      await saveJson(`vaa-${sequence}`, vaaRaw);

      console.log(`✅ VAA ${sequence} fetched and saved`);

      sequence++;
      saveSequence(sequence);
      fetched++;
    } catch (err) {
      console.warn(`⚠️ VAA ${sequence} not available yet`);
    }

    await sleep(SLEEP_MS);
  }
}

main().catch((err) => {
  console.error("❌ VAA fetcher fatal error");
  console.error(err);
  process.exit(1);
});
