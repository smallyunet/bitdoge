// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BitDoge.sol";

interface IDeployer {
    function safeCreate2(bytes32 salt, bytes calldata initializationCode) external payable returns (address deploymentAddress);
}

contract DeployBitDoge is Script {
    // Immutable Create2 Factory (Standard)
    IDeployer constant FACTORY = IDeployer(0x0000000000FFe8B47B3e2130213B802212439497);
    
    // Salt found by cpu miner
    bytes32 constant SALT = 0x00000000000000000000000000000000000000000000000000000000ee61351e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Get the creation code for BitDoge
        bytes memory initCode = type(BitDoge).creationCode;

        // Deploy using the factory
        console.log("Deploying BitDoge via factory...");
        address deployedAddress = FACTORY.safeCreate2(SALT, initCode);
        
        console.log("Deployed BitDoge at:", deployedAddress);

        vm.stopBroadcast();
    }
}
