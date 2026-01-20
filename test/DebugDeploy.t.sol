// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BitDoge.sol";

interface IDeployer {
    function safeCreate2(bytes32 salt, bytes calldata initializationCode) external payable returns (address deploymentAddress);
}

contract DebugDeploy is Test {
    IDeployer constant FACTORY = IDeployer(0x0000000000FFe8B47B3e2130213B802212439497);
    bytes32 constant SALT = 0x00000000000000000000000000000000000000000000000000000000ee61351e;

    function setUp() public {
        // Forking mainnet is handled via CLI --rpc-url
    }

    function testDeploy() public {
        bytes memory initCode = type(BitDoge).creationCode;
        
        vm.prank(address(0x123)); // Any sender
        address deployed = FACTORY.safeCreate2(SALT, initCode);
        
        console.log("Deployed at:", deployed);
        assertTrue(deployed != address(0), "Deployment failed");
    }
}
