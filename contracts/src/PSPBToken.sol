// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PSPBToken
 * @dev Упрощённый ERC-20 токен для демо
 */
contract PSPBToken {
    string public name = "P2PSPB Token";
    string public symbol = "PSPB";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        // Минтим 100 миллионов токенов создателю
        totalSupply = 100_000_000 * 10**18;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balanceOf[from] >= amount, "Insufficient balance");
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    // Функция для airdrop (только для демо)
    function claimAirdrop() external {
        require(balanceOf[address(this)] >= 1000 * 10**18, "Airdrop empty");
        balanceOf[address(this)] -= 1000 * 10**18;
        balanceOf[msg.sender] += 1000 * 10**18;
        emit Transfer(address(this), msg.sender, 1000 * 10**18);
    }
}
