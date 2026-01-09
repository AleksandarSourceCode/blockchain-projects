import { Connection } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { NftInfo } from "../../types/nftInfo.js";
import { nftsScanFromList } from "../scan/nftsScanFromList.js";
import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Runs an NFT scan from an existing token list and writes the result to a JSON file
 */
export async function runNftScanFromList(
  connection: Connection,
  tokens: TokenInfo[],
  outputFilePath: string
): Promise<NftInfo[]>
{
  const nfts = await nftsScanFromList(connection, tokens);

  writeJson(outputFilePath, nfts);

  debugLog(
    "[NFT] scan from list completed",
    `${nfts.length} NFTs saved`
  );

  return nfts;
}
