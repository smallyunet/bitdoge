// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BitDoge} from "../src/BitDoge.sol"; // Adjust path if your file is named differently

contract BitDogeTest is Test {
    BitDoge public bitDoge;
    
    // The Genesis Block defined in your contract
    uint256 constant GENESIS_BLOCK = 24444444;

    function setUp() public {
        // Deploy the contract before each test
        bitDoge = new BitDoge();
        
        // Ensure we are currently at a block before Genesis
        // (Foundry defaults to block 1, so this is safe)
        vm.roll(GENESIS_BLOCK - 100);
    }

    function testGenesis_BeforeAndAfter() public {
        // ====================================================
        // SCENARIO 1: Premature Mining (Before Genesis)
        // ====================================================
        
        // Expect the specific revert message defined in the contract
        // Note: We use the exact string: "BitDoge loading... Wait for Block #24444444!"
        vm.expectRevert(bytes("BitDoge loading... Wait for Block #24444444!"));
        
        // Attempt to send 0 ETH to the contract
        (bool success, ) = address(bitDoge).call{value: 0}("");
        
        // Confirm that the transaction failed (though expectRevert handles the assertion)
        // This is just to demonstrate the flow.
        
        // ====================================================
        // SCENARIO 2: Time Travel (Warp to Genesis)
        // ====================================================
        
        // Cheatcode: Fast forward the blockchain height to the Genesis Block
        vm.roll(GENESIS_BLOCK);
        
        // ====================================================
        // SCENARIO 3: Valid Mining (At Genesis)
        // ====================================================
        
        // Attempt to mint again
        vm.prank(tx.origin);
        (success, ) = address(bitDoge).call{value: 0}("");
        
        // Assertions:
        // 1. Transaction should succeed
        assertTrue(success, "Minting should succeed at Genesis Block");
        
        // 2. Miner (this test contract) should receive 1 BitDoge (1e18)
        assertEq(bitDoge.balanceOf(tx.origin), 1 ether, "Miner should receive 1 BITDOGE");
        
        // 3. Total Supply should be 1
        assertEq(bitDoge.totalSupply(), 1 ether, "Total Supply should be 1");
    }

    function testEntropy_BlackHole() public {
        // 1. Move to Genesis and mine the first block
        vm.roll(GENESIS_BLOCK);
        vm.prank(tx.origin);
        (bool s, ) = address(bitDoge).call{value: 0}("");
        require(s, "Mining failed");

        // 2. Simulate the "Entropy/Void" scenario
        // Skip 10 blocks where no one interacts (Block 24444445 to 24444454 are missed)
        // We move to block #24444455
        uint256 blocksSkipped = 10;
        vm.roll(GENESIS_BLOCK + blocksSkipped + 1);

        // 3. New user interacts at block #24444455
        address newUser = address(0x123);
        vm.deal(newUser, 1 ether); // Give them some ETH for gas (simulated)
        
        vm.prank(newUser, newUser); // Next call comes from newUser, acting as EOA
        (bool success, ) = address(bitDoge).call{value: 0}("");
        assertTrue(success);

        // ====================================================
        // VERIFY THE BLACK HOLE MECHANIC
        // ====================================================
        
        // A. The user should ONLY get the reward for the current block (1.0)
        assertEq(bitDoge.balanceOf(newUser), 1 ether, "User gets 1 block reward");

        // B. The Black Hole (dEaD address) should have swallowed the 10 missed blocks
        address burnAddress = 0x000000000000000000000000000000000000dEaD;
        assertEq(bitDoge.balanceOf(burnAddress), 10 ether, "Black Hole should swallow 10 missed blocks");
    }
}