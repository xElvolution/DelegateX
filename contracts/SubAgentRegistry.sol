// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SubAgentRegistry is Ownable {

    struct AgentRecord {
        bytes32 taskId;
        address owner;
        string agentType;
        uint256 budget;
        uint256 spent;
        uint256 createdAt;
        uint256 completedAt;
        bool active;
    }

    mapping(address => AgentRecord) public agents;
    mapping(bytes32 => address[]) public taskToAgents;
    mapping(address => bytes32[]) public ownerToTasks;

    uint256 public totalAgentsSpawned;
    uint256 public totalTasksCompleted;

    event AgentRegistered(address indexed agent, bytes32 indexed taskId, string agentType, uint256 budget);
    event AgentCompleted(address indexed agent, bytes32 indexed taskId, uint256 spent);
    event AgentDeactivated(address indexed agent, bytes32 indexed taskId);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        address agent,
        bytes32 taskId,
        address owner,
        string calldata agentType,
        uint256 budget
    ) external onlyOwner {
        agents[agent] = AgentRecord({
            taskId: taskId,
            owner: owner,
            agentType: agentType,
            budget: budget,
            spent: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            active: true
        });

        taskToAgents[taskId].push(agent);
        ownerToTasks[owner].push(taskId);
        totalAgentsSpawned++;

        emit AgentRegistered(agent, taskId, agentType, budget);
    }

    function completeAgent(address agent, uint256 spent) external onlyOwner {
        AgentRecord storage record = agents[agent];
        require(record.active, "Agent not active");

        record.active = false;
        record.spent = spent;
        record.completedAt = block.timestamp;

        emit AgentCompleted(agent, record.taskId, spent);
    }

    function deactivateAgent(address agent) external onlyOwner {
        AgentRecord storage record = agents[agent];
        require(record.active, "Agent not active");
        record.active = false;

        emit AgentDeactivated(agent, record.taskId);
    }

    function getTaskAgents(bytes32 taskId) external view returns (address[] memory) {
        return taskToAgents[taskId];
    }

    function getOwnerTasks(address owner) external view returns (bytes32[] memory) {
        return ownerToTasks[owner];
    }

    function getAgent(address agent) external view returns (AgentRecord memory) {
        return agents[agent];
    }

    function isActiveAgent(address agent) external view returns (bool) {
        return agents[agent].active;
    }
}
