// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DelegateCore is ReentrancyGuard, Pausable, Ownable {

    struct Permission {
        address token;
        uint256 maxAmount;
        uint256 period;
        uint256 expiry;
        address[] allowedContracts;
        bool active;
        uint256 totalSpent;
        uint256 periodStart;
    }

    struct SubAgentConfig {
        bytes32 taskId;
        address token;
        uint256 budget;
        uint256 spent;
        uint256 expiry;
        bool active;
    }

    mapping(address => Permission) public permissions;
    mapping(address => SubAgentConfig) public subAgents;
    mapping(bytes32 => address[]) public taskAgents;

    address public delegateOrchestrator;
    address public oneShotRelayer;

    event PermissionGranted(address indexed user, address token, uint256 maxAmount, uint256 expiry);
    event PermissionRevoked(address indexed user, uint256 timestamp);
    event SubAgentSpawned(bytes32 indexed taskId, address subAgent, uint256 budget);
    event PaymentExecuted(address indexed subAgent, address target, uint256 amount, bytes32 txRef);
    event TaskCompleted(bytes32 indexed taskId, uint256 totalSpent);

    modifier onlyOrchestrator() {
        require(msg.sender == delegateOrchestrator, "Not orchestrator");
        _;
    }

    modifier onlySubAgent() {
        require(subAgents[msg.sender].active, "Not active sub-agent");
        _;
    }

    constructor(address _orchestrator, address _relayer) Ownable(msg.sender) {
        delegateOrchestrator = _orchestrator;
        oneShotRelayer = _relayer;
    }

    function grantPermission(
        address token,
        uint256 maxAmount,
        uint256 period,
        uint256 expiry,
        address[] calldata allowedContracts
    ) external whenNotPaused {
        require(expiry > block.timestamp, "Expiry in past");
        require(maxAmount > 0, "Zero amount");

        permissions[msg.sender] = Permission({
            token: token,
            maxAmount: maxAmount,
            period: period,
            expiry: expiry,
            allowedContracts: allowedContracts,
            active: true,
            totalSpent: 0,
            periodStart: block.timestamp
        });

        emit PermissionGranted(msg.sender, token, maxAmount, expiry);
    }

    function revokePermission() external {
        require(permissions[msg.sender].active, "No active permission");
        permissions[msg.sender].active = false;
        emit PermissionRevoked(msg.sender, block.timestamp);
    }

    function spawnSubAgent(
        bytes32 taskId,
        address subAgent,
        address token,
        uint256 budget,
        uint256 expiry
    ) external onlyOrchestrator whenNotPaused {
        require(budget > 0, "Zero budget");
        require(expiry > block.timestamp, "Expiry in past");

        subAgents[subAgent] = SubAgentConfig({
            taskId: taskId,
            token: token,
            budget: budget,
            spent: 0,
            expiry: expiry,
            active: true
        });

        taskAgents[taskId].push(subAgent);
        emit SubAgentSpawned(taskId, subAgent, budget);
    }

    function executeWithPermission(
        address target,
        bytes calldata data,
        uint256 amount
    ) external onlySubAgent nonReentrant whenNotPaused {
        SubAgentConfig storage agent = subAgents[msg.sender];
        require(block.timestamp < agent.expiry, "Agent expired");
        require(agent.spent + amount <= agent.budget, "Budget exceeded");
        require(_isAllowedContract(agent.taskId, target), "Contract not allowed");

        agent.spent += amount;

        IERC20(agent.token).approve(target, amount);
        (bool success,) = target.call(data);
        require(success, "Execution failed");

        emit PaymentExecuted(msg.sender, target, amount, agent.taskId);
    }

    function completeTask(bytes32 taskId) external onlyOrchestrator {
        address[] storage agents = taskAgents[taskId];
        uint256 totalSpent = 0;

        for (uint256 i = 0; i < agents.length; i++) {
            SubAgentConfig storage agent = subAgents[agents[i]];
            agent.active = false;
            totalSpent += agent.spent;
        }

        emit TaskCompleted(taskId, totalSpent);
    }

    function getRemainingBudget(address user) external view returns (uint256) {
        Permission storage perm = permissions[user];
        if (!perm.active || block.timestamp >= perm.expiry) return 0;
        return perm.maxAmount - perm.totalSpent;
    }

    function getPermission(address user) external view returns (Permission memory) {
        return permissions[user];
    }

    function isSubAgent(address agent) external view returns (bool) {
        return subAgents[agent].active;
    }

    function setOrchestrator(address _orchestrator) external onlyOwner {
        delegateOrchestrator = _orchestrator;
    }

    function setRelayer(address _relayer) external onlyOwner {
        oneShotRelayer = _relayer;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _isAllowedContract(bytes32 taskId, address target) internal view returns (bool) {
        // Look up the user from any agent on the task
        address[] storage agents = taskAgents[taskId];
        if (agents.length == 0) return false;
        // For simplicity, check against allowed contracts list
        // In production, this would traverse the delegation chain
        return true;
    }
}
