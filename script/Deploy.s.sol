// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/MockUSDC.sol";
import "../contracts/SubAgentRegistry.sol";
import "../contracts/X402PaymentVerifier.sol";
import "../contracts/DelegateCore.sol";

/// @notice Deploys the full DELEGATE stack to Base Sepolia and seeds test USDC.
///
/// Env vars (all optional, sensible defaults):
///   AGENT_ADDRESS    - backend orchestrator/agent EOA (defaults to deployer)
///   ONESHOT_WALLET   - 1Shot managed wallet address    (defaults to deployer)
///
/// Run:
///   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address orchestrator = vm.envOr("AGENT_ADDRESS", deployer);
        address relayer = vm.envOr("ONESHOT_WALLET", deployer);

        vm.startBroadcast(pk);

        // 1. Test token (deployer is seeded with 1,000,000 USDC in the constructor).
        MockUSDC usdc = new MockUSDC();

        // 2. Registry + payment verifier (owned by deployer == orchestrator by default).
        SubAgentRegistry registry = new SubAgentRegistry();
        X402PaymentVerifier verifier = new X402PaymentVerifier();

        // 3. Core delegation contract.
        DelegateCore core = new DelegateCore(orchestrator, relayer);

        // 4. Fund the spending wallets so agents can make real transfers.
        if (orchestrator != deployer) {
            usdc.mint(orchestrator, 100_000 * 10 ** 6);
        }
        if (relayer != deployer && relayer != orchestrator) {
            usdc.mint(relayer, 100_000 * 10 ** 6);
        }

        // 5. If the agent/orchestrator is a separate wallet, hand it the record
        //    contracts so it can call the onlyOwner registerAgent/recordPayment.
        if (orchestrator != deployer) {
            registry.transferOwnership(orchestrator);
            verifier.transferOwnership(orchestrator);
        }

        vm.stopBroadcast();

        console.log("== DELEGATE deployed on Base Sepolia ==");
        console.log("MockUSDC            :", address(usdc));
        console.log("SubAgentRegistry    :", address(registry));
        console.log("X402PaymentVerifier :", address(verifier));
        console.log("DelegateCore        :", address(core));
        console.log("Orchestrator/agent  :", orchestrator);
        console.log("Relayer (1Shot)     :", relayer);
        console.log("");
        console.log("Add these to .env.local:");
        console.log("NEXT_PUBLIC_MOCK_USDC_ADDRESS=", address(usdc));
        console.log("NEXT_PUBLIC_SUB_AGENT_REGISTRY_ADDRESS=", address(registry));
        console.log("NEXT_PUBLIC_X402_VERIFIER_ADDRESS=", address(verifier));
        console.log("NEXT_PUBLIC_DELEGATE_CORE_ADDRESS=", address(core));
    }
}
