import { PublicKey } from "@solana/web3.js";
import { WALLET_ADDRESS } from "../constants.js";

/**
 * Wallet public key derived from configured address
 */
export const walletPublicKey = new PublicKey(WALLET_ADDRESS);
