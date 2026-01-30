// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IWormhole} from "../interfaces/IWormhole.sol";

contract WormholeMock is IWormhole {
    event MessagePublished(uint32 nonce, bytes payload, uint8 consistencyLevel);

    uint64 internal sequence;

    function publishMessage(
        uint32 nonce,
        bytes calldata payload,
        uint8 consistencyLevel
    ) external returns (uint64) {
        sequence += 1;
        emit MessagePublished(nonce, payload, consistencyLevel);
        return sequence;
    }
}
