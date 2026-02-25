// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PSPBToken.sol";

/**
 * @title P2PSPBEscrow
 * @dev Упрощённый контракт для депонирования средств (для демо)
 */
contract P2PSPBEscrow {
    PSPBToken public token;
    address public owner;
    
    struct Trade {
        uint256 id;
        address seller;
        address buyer;
        uint256 amount;
        uint256 rate;
        uint256 fee;
        uint256 createdAt;
        TradeStatus status;
    }
    
    enum TradeStatus {
        Created,
        Reserved,
        PaymentPending,
        Paid,
        Confirmed,
        Completed,
        Disputed,
        Resolved,
        Cancelled
    }
    
    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;
    
    event TradeCreated(uint256 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeCancelled(uint256 indexed tradeId);
    
    constructor(address _token) {
        token = PSPBToken(_token);
        owner = msg.sender;
    }
    
    function createTrade(
        address buyer,
        uint256 amount,
        uint256 rate
    ) external returns (uint256) {
        tradeCounter++;
        uint256 fee = (amount * 5) / 1000; // 0.5% комиссия
        
        trades[tradeCounter] = Trade({
            id: tradeCounter,
            seller: msg.sender,
            buyer: buyer,
            amount: amount,
            rate: rate,
            fee: fee,
            createdAt: block.timestamp,
            status: TradeStatus.Created
        });
        
        emit TradeCreated(tradeCounter, msg.sender, buyer, amount);
        return tradeCounter;
    }
    
    function completeTrade(uint256 tradeId) external {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Confirmed, "Invalid status");
        require(msg.sender == trade.seller || msg.sender == trade.buyer, "Not authorized");
        
        trade.status = TradeStatus.Completed;
        
        // Перевод комиссии
        if (trade.fee > 0) {
            token.transfer(owner, trade.fee);
        }
        
        // Остаток продавцу
        token.transfer(trade.seller, trade.amount - trade.fee);
        
        emit TradeCompleted(tradeId);
    }
    
    function cancelTrade(uint256 tradeId) external {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Created || trade.status == TradeStatus.Reserved, "Invalid status");
        require(msg.sender == trade.seller || msg.sender == trade.buyer, "Not authorized");
        
        trade.status = TradeStatus.Cancelled;
        emit TradeCancelled(tradeId);
    }
    
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
}
