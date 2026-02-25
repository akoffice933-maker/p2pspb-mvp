// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PSPBToken.sol";

/**
 * @title P2PSPBFeeSplitter
 * @dev Упрощённый контракт для распределения комиссий (для демо)
 */
contract P2PSPBFeeSplitter {
    PSPBToken public token;
    address public treasury;
    address public devFund;
    
    uint256 public constant TREASURY_SHARE = 20; // 20%
    uint256 public constant DEV_SHARE = 20;      // 20%
    uint256 public constant VALIDATOR_SHARE = 60; // 60%
    
    event FeeReceived(uint256 amount);
    event FeeDistributed(uint256 treasuryAmount, uint256 devAmount, uint256 validatorAmount);
    
    constructor(address _token, address _treasury, address _devFund) {
        token = PSPBToken(_token);
        treasury = _treasury;
        devFund = _devFund;
    }
    
    function receiveFee(uint256 amount) external {
        uint256 treasuryAmount = (amount * TREASURY_SHARE) / 100;
        uint256 devAmount = (amount * DEV_SHARE) / 100;
        uint256 validatorAmount = (amount * VALIDATOR_SHARE) / 100;
        
        token.transfer(treasury, treasuryAmount);
        token.transfer(devFund, devAmount);
        // Валидаторам можно распределить через стейкинг
        
        emit FeeReceived(amount);
        emit FeeDistributed(treasuryAmount, devAmount, validatorAmount);
    }
}
