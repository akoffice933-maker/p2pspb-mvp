// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PSPBToken.sol";

/**
 * @title P2PSPB FeeSplitter
 * @dev Контракт для распределения комиссий между валидаторами/майнерами
 * 
 * Распределение комиссий:
 * - 60% Валидаторам/майнерам (награда за блок)
 * - 20% Treasury (казна платформы)
 * - 20% Development (развитие)
 * 
 * Функционал:
 * - Автоматическое распределение комиссий
 * - Стейкинг для валидаторов
 * - Claim наград
 */
contract P2PSPBFeeSplitter is Ownable {
    PSPBToken public token;
    
    // Адреса для распределения
    address public treasury;
    address public developmentFund;
    
    // Валидаторы и их стейки
    struct Validator {
        uint256 stakedAmount;
        uint256 rewards;
        uint256 lastClaimTime;
        bool isActive;
        uint256 blocksValidated;
    }
    
    mapping(address => Validator) public validators;
    address[] public validatorList;
    
    // Конфигурация
    uint256 public constant VALIDATOR_SHARE = 60; // 60%
    uint256 public constant TREASURY_SHARE = 20;  // 20%
    uint256 public constant DEVELOPMENT_SHARE = 20; // 20%
    
    uint256 public minimumStake = 10000 * 10**18; // 10,000 PSPB
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // События
    event FeeReceived(uint256 amount);
    event FeeDistributed(
        uint256 totalAmount,
        uint256 validatorAmount,
        uint256 treasuryAmount,
        uint256 developmentAmount
    );
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorUnstaked(address indexed validator, uint256 amount);
    event RewardsClaimed(address indexed validator, uint256 amount);
    event TreasuryUpdated(address indexed oldAddress, address indexed newAddress);
    event DevelopmentFundUpdated(address indexed oldAddress, address indexed newAddress);
    
    constructor(address _token, address _treasury, address _devFund) Ownable(msg.sender) {
        token = PSPBToken(_token);
        treasury = _treasury;
        developmentFund = _devFund;
    }
    
    /**
     * @dev Получить комиссию от Escrow контракта
     */
    function receiveFee(uint256 amount) external {
        require(msg.sender == owner(), "Only owner");
        require(amount > 0, "Amount must be > 0");
        
        emit FeeReceived(amount);
        
        _distributeFee(amount);
    }
    
    /**
     * @dev Распределение комиссии
     */
    function _distributeFee(uint256 amount) internal {
        uint256 validatorAmount = (amount * VALIDATOR_SHARE) / 100;
        uint256 treasuryAmount = (amount * TREASURY_SHARE) / 100;
        uint256 developmentAmount = (amount * DEVELOPMENT_SHARE) / 100;
        
        // Treasury
        if (treasuryAmount > 0 && treasury != address(0)) {
            require(token.transfer(treasury, treasuryAmount), "Treasury transfer failed");
        }
        
        // Development
        if (developmentAmount > 0 && developmentFund != address(0)) {
            require(
                token.transfer(developmentFund, developmentAmount),
                "Dev transfer failed"
            );
        }
        
        // Валидаторы (добавляем в пул наград)
        if (validatorAmount > 0) {
            totalRewardsDistributed += validatorAmount;
        }
        
        emit FeeDistributed(amount, validatorAmount, treasuryAmount, developmentAmount);
    }
    
    /**
     * @dev Стейкинг для валидаторов
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount >= minimumStake / 10, "Too small"); // Минимум 10% от required
        
        Validator storage validator = validators[msg.sender];
        
        if (!validator.isActive) {
            validator.isActive = true;
            validatorList.push(msg.sender);
        }
        
        validator.stakedAmount += amount;
        totalStaked += amount;
        
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Stake transfer failed"
        );
        
        emit ValidatorStaked(msg.sender, amount);
    }
    
    /**
     * @dev Анстейкинг (с задержкой)
     */
    function unstake(uint256 amount) external nonReentrant {
        Validator storage validator = validators[msg.sender];
        require(validator.isActive, "Not a validator");
        require(validator.stakedAmount >= amount, "Insufficient staked");
        
        // Claim rewards first
        _claimRewards(msg.sender);
        
        validator.stakedAmount -= amount;
        totalStaked -= amount;
        
        // Если стейк меньше минимума, деактивируем
        if (validator.stakedAmount < minimumStake / 10) {
            validator.isActive = false;
            // Удаляем из списка (можно оптимизировать)
            _removeFromValidatorList(msg.sender);
        }
        
        require(token.transfer(msg.sender, amount), "Unstake transfer failed");
        
        emit ValidatorUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim наград валидатором
     */
    function claimRewards() external nonReentrant returns (uint256) {
        return _claimRewards(msg.sender);
    }
    
    /**
     * @dev Внутренняя функция claim наград
     */
    function _claimRewards(address validator) internal returns (uint256) {
        Validator storage v = validators[validator];
        require(v.isActive, "Not a validator");
        
        uint256 reward = _calculateRewards(validator);
        require(reward > 0, "No rewards");
        
        v.rewards = 0;
        v.lastClaimTime = block.timestamp;
        
        require(token.transfer(validator, reward), "Reward transfer failed");
        
        totalRewardsDistributed += reward;
        
        emit RewardsClaimed(validator, reward);
        
        return reward;
    }
    
    /**
     * @dev Расчёт наград валидатора
     * Формула: (stakedAmount / totalStaked) * totalRewardsDistributed
     */
    function _calculateRewards(address validator) internal view returns (uint256) {
        Validator memory v = validators[validator];
        if (!v.isActive || v.stakedAmount == 0 || totalStaked == 0) {
            return 0;
        }
        
        // Пропорционально стейку
        uint256 share = (v.stakedAmount * 10000) / totalStaked;
        uint256 totalRewards = totalRewardsDistributed / 10000;
        
        return (v.stakedAmount * totalRewards) / totalStaked;
    }
    
    /**
     * @dev Удалить валидатора из списка
     */
    function _removeFromValidatorList(address validator) internal {
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validatorList[i] == validator) {
                validatorList[i] = validatorList[validatorList.length - 1];
                validatorList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Обновить адрес treasury
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }
    
    /**
     * @dev Обновить адрес development fund
     */
    function setDevelopmentFund(address _devFund) external onlyOwner {
        require(_devFund != address(0), "Invalid address");
        emit DevelopmentFundUpdated(developmentFund, _devFund);
        developmentFund = _devFund;
    }
    
    /**
     * @dev Обновить минимальный стейк
     */
    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
    }
    
    /**
     * @dev Получить информацию о валидаторе
     */
    function getValidator(address validator) external view returns (Validator memory) {
        return validators[validator];
    }
    
    /**
     * @dev Получить количество валидаторов
     */
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    /**
     * @dev Получить список всех валидаторов
     */
    function getAllValidators() external view returns (address[] memory) {
        return validatorList;
    }
    
    /**
     * @dev Получить доступные награды для валидатора
     */
    function getPendingRewards(address validator) external view returns (uint256) {
        return _calculateRewards(validator);
    }
    
    /**
     * @dev Модификатор nonReentrant
     */
    modifier nonReentrant() {
        require(msg.sender != address(this), "Reentrant call");
        _;
    }
}
