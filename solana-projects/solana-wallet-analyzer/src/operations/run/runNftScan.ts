import { Connection, PublicKey } from "@solana/web3.js";

import { nftScan } from "../scan/nftScan.js";
import { writeJson } from "../../utils/writeJson.js";
import { NftInfo } from "../../types/nftInfo.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Runs an NFT scan by wallet address and writes the result to a JSON file
 */
export async function runNftScan(
  connection: Connection,
  walletPublicKey: PublicKey,
  outputFilePath: string
): Promise<NftInfo[]>
{
  const nfts = await nftScan(connection, walletPublicKey);

  writeJson(outputFilePath, nfts);

  debugLog(
    "[NFT] scan by wallet completed",
    `${nfts.length} NFTs saved`
  );

  return nfts;
}
