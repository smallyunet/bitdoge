// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BitDoge} from "../src/BitDoge.sol";

contract GetInitCodeHash is Script {
    function run() public pure {
        bytes memory initCode = type(BitDoge).creationCode;
        // If constructor arguments exist, we would append them here. 
        // BitDoge has no constructor arguments.
        
        console.log("----------------------------------------------------------------");
        console.log("BitDoge Init Code Hash (Keccak256):");
        console.logBytes32(keccak256(initCode));
        console.log("----------------------------------------------------------------");
        console.log("Used for CREATE2 Vanity Address Calculation via profanity2");
    }
}
