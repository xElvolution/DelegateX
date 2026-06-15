// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Test USDC for DELEGATE on Base Sepolia. 6 decimals to mirror real USDC.
///         Open mint + self-serve faucet so anyone (judges included) can fund a
///         wallet and watch real on-chain transfers happen.
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 1_000 * 10 ** DECIMALS; // 1,000 USDC per faucet call

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Seed the deployer with 1,000,000 USDC for funding agent wallets.
        _mint(msg.sender, 1_000_000 * 10 ** DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /// @notice Mint arbitrary amounts to any address. Open on purpose for testnet.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Mint a fixed amount of test USDC to the caller.
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
