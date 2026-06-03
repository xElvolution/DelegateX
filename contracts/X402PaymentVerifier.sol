// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract X402PaymentVerifier is Ownable {

    struct PaymentRecord {
        address payer;
        address recipient;
        uint256 amount;
        bytes32 resourceId;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => PaymentRecord) public payments;
    mapping(address => uint256) public totalPaid;
    mapping(address => uint256) public totalReceived;

    uint256 public totalPayments;

    event PaymentVerified(bytes32 indexed paymentId, address indexed payer, address recipient, uint256 amount);
    event PaymentRecorded(bytes32 indexed paymentId, address indexed payer, bytes32 resourceId);

    constructor() Ownable(msg.sender) {}

    function recordPayment(
        bytes32 paymentId,
        address payer,
        address recipient,
        uint256 amount,
        bytes32 resourceId
    ) external onlyOwner {
        require(payments[paymentId].timestamp == 0, "Payment exists");

        payments[paymentId] = PaymentRecord({
            payer: payer,
            recipient: recipient,
            amount: amount,
            resourceId: resourceId,
            timestamp: block.timestamp,
            verified: false
        });

        totalPaid[payer] += amount;
        totalReceived[recipient] += amount;
        totalPayments++;

        emit PaymentRecorded(paymentId, payer, resourceId);
    }

    function verifyPayment(bytes32 paymentId) external onlyOwner {
        PaymentRecord storage record = payments[paymentId];
        require(record.timestamp > 0, "Payment not found");
        require(!record.verified, "Already verified");

        record.verified = true;
        emit PaymentVerified(paymentId, record.payer, record.recipient, record.amount);
    }

    function getPayment(bytes32 paymentId) external view returns (PaymentRecord memory) {
        return payments[paymentId];
    }

    function isPaymentVerified(bytes32 paymentId) external view returns (bool) {
        return payments[paymentId].verified;
    }
}
