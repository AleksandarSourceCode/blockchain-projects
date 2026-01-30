// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Wormhole core interface (minimal)
interface IWormhole {
    function publishMessage(
        uint32 nonce,
        bytes calldata payload,
        uint8 consistencyLevel
    ) external returns (uint64 sequence);
}
