// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PSPBToken.sol";

/**
 * @title P2PSPB Escrow
 * @dev Контракт для безопасного депонирования средств в P2P сделках
 * 
 * Статусы сделки:
 * 0 - Created (создана)
 * 1 - Reserved (средства зарезервированы)
 * 2 - PaymentPending (ожидает оплаты)
 * 3 - Paid (оплачено)
 * 4 - Confirmed (подтверждено)
 * 5 - Completed (завершено)
 * 6 - Disputed (спор)
 * 7 - Resolved (решён)
 * 8 - Cancelled (отменено)
 */
contract P2PSPBEscrow is ReentrancyGuard, Ownable {
    PSPBToken public token;
    address public feeSplitter;
    
    // Структура сделки
    struct Trade {
        uint256 id;
        address seller;
        address buyer;
        uint256 amount;           // Сумма в USDT (условно)
        uint256 rate;             // Курс обмена
        uint256 fee;              // Комиссия платформы
        uint256 createdAt;
        uint256 expiresAt;
        TradeStatus status;
        bytes32 orderHash;        // Хеш заказа из оффчейн базы
    }
    
    // Статусы сделки
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
    
    // События
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        uint256 fee
    );
    event TradeConfirmed(uint256 indexed tradeId);
    event TradeCompleted(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    event TradeCancelled(uint256 indexed tradeId);
    event DisputeCreated(uint256 indexed tradeId, address indexed initiator);
    event DisputeResolved(
        uint256 indexed tradeId,
        address indexed winner,
        uint256 amount
    );
    event FeeCollected(uint256 indexed tradeId, uint256 amount);
    
    // Хранилище сделок
    mapping(uint256 => Trade) public trades;
    mapping(bytes32 => uint256) public orderHashToTradeId;
    uint256 public tradeCounter;
    
    // Комиссия платформы (0.5% = 50 basis points)
    uint256 public platformFeeBps = 50;
    uint256 public constant MAX_FEE_BPS = 100; // 1% максимум
    
    constructor(address _token) Ownable(msg.sender) {
        token = PSPBToken(_token);
    }
    
    /**
     * @dev Установить адрес FeeSplitter
     */
    function setFeeSplitter(address _feeSplitter) external onlyOwner {
        require(_feeSplitter != address(0), "Invalid address");
        feeSplitter = _feeSplitter;
    }
    
    /**
     * @dev Обновить комиссию платформы
     */
    function setPlatformFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        platformFeeBps = _feeBps;
    }
    
    /**
     * @dev Создать новую сделку
     * @param buyer Адрес покупателя
     * @param amount Сумма сделки
     * @param rate Курс обмена
     * @param orderHash Хеш заказа из оффчейн базы
     */
    function createTrade(
        address buyer,
        uint256 amount,
        uint256 rate,
        bytes32 orderHash
    ) external nonReentrant returns (uint256) {
        require(buyer != address(0), "Invalid buyer");
        require(amount > 0, "Amount must be > 0");
        require(orderHashToTradeId[orderHash] == 0, "Order already exists");
        
        // Расчёт комиссии
        uint256 fee = (amount * platformFeeBps) / 10000;
        
        tradeCounter++;
        trades[tradeCounter] = Trade({
            id: tradeCounter,
            seller: msg.sender,
            buyer: buyer,
            amount: amount,
            rate: rate,
            fee: fee,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + 24 hours,
            status: TradeStatus.Created,
            orderHash: orderHash
        });
        
        orderHashToTradeId[orderHash] = tradeCounter;
        
        emit TradeCreated(tradeCounter, msg.sender, buyer, amount, fee);
        
        return tradeCounter;
    }
    
    /**
     * @dev Зарезервировать средства продавца
     */
    function reserveFunds(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(msg.sender == trade.seller, "Only seller");
        require(trade.status == TradeStatus.Created, "Invalid status");
        
        // Переводим средства от продавца на escrow
        require(
            token.transferFrom(trade.seller, address(this), trade.amount),
            "Transfer failed"
        );
        
        trade.status = TradeStatus.Reserved;
    }
    
    /**
     * @dev Подтвердить оплату (покупатель)
     */
    function confirmPayment(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(msg.sender == trade.buyer, "Only buyer");
        require(trade.status == TradeStatus.Reserved, "Invalid status");
        
        trade.status = TradeStatus.PaymentPending;
    }
    
    /**
     * @dev Подтвердить получение средств (продавец)
     */
    function confirmReceipt(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(msg.sender == trade.seller, "Only seller");
        require(
            trade.status == TradeStatus.PaymentPending ||
            trade.status == TradeStatus.Paid,
            "Invalid status"
        );
        
        trade.status = TradeStatus.Confirmed;
    }
    
    /**
     * @dev Завершить сделку и распределить средства
     */
    function completeTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(trade.status == TradeStatus.Confirmed, "Invalid status");
        
        trade.status = TradeStatus.Completed;
        
        // Распределение средств
        uint256 sellerAmount = trade.amount - trade.fee;
        
        // Комиссия в feeSplitter
        if (trade.fee > 0 && feeSplitter != address(0)) {
            require(token.transfer(feeSplitter, trade.fee), "Fee transfer failed");
            emit FeeCollected(tradeId, trade.fee);
        }
        
        // Остаток продавцу
        require(
            token.transfer(trade.seller, sellerAmount),
            "Seller transfer failed"
        );
        
        emit TradeCompleted(tradeId, trade.seller, trade.buyer, trade.amount);
    }
    
    /**
     * @dev Отменить сделку и вернуть средства
     */
    function cancelTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(
            msg.sender == trade.seller || msg.sender == trade.buyer,
            "Only parties"
        );
        require(
            trade.status == TradeStatus.Created ||
            trade.status == TradeStatus.Reserved,
            "Invalid status"
        );
        
        trade.status = TradeStatus.Cancelled;
        
        // Возврат средств продавцу
        if (trade.status == TradeStatus.Reserved) {
            require(
                token.transfer(trade.seller, trade.amount),
                "Refund failed"
            );
        }
        
        emit TradeCancelled(tradeId);
    }
    
    /**
     * @dev Создать спор
     */
    function createDispute(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(
            msg.sender == trade.seller || msg.sender == trade.buyer,
            "Only parties"
        );
        require(
            trade.status == TradeStatus.PaymentPending ||
            trade.status == TradeStatus.Paid ||
            trade.status == TradeStatus.Confirmed,
            "Invalid status"
        );
        
        trade.status = TradeStatus.Disputed;
        
        emit DisputeCreated(tradeId, msg.sender);
    }
    
    /**
     * @dev Решить спор (только владелец/арбитр)
     * @param tradeId ID сделки
     * @param winner Адрес победителя
     * @param amount Сумма к выплате
     */
    function resolveDispute(
        uint256 tradeId,
        address winner,
        uint256 amount
    ) external onlyOwner nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.id != 0, "Trade does not exist");
        require(trade.status == TradeStatus.Disputed, "No dispute");
        require(winner == trade.seller || winner == trade.buyer, "Invalid winner");
        
        trade.status = TradeStatus.Resolved;
        
        // Выплата победителю
        require(token.transfer(winner, amount), "Transfer failed");
        
        // Остаток (если есть) возвращаем проигравшему
        uint256 remaining = trade.amount - amount;
        if (remaining > 0) {
            address loser = winner == trade.seller ? trade.buyer : trade.seller;
            require(token.transfer(loser, remaining), "Refund failed");
        }
        
        emit DisputeResolved(tradeId, winner, amount);
    }
    
    /**
     * @dev Получить информацию о сделке
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
    
    /**
     * @dev Получить статус сделки
     */
    function getTradeStatus(uint256 tradeId) external view returns (TradeStatus) {
        return trades[tradeId].status;
    }
    
    /**
     * @dev Получить ID сделки по хешу заказа
     */
    function getTradeIdByOrderHash(bytes32 orderHash) external view returns (uint256) {
        return orderHashToTradeId[orderHash];
    }
    
    /**
     * @dev Экстренный вывод застрявших токенов
     */
    function emergencyWithdraw(address _token, uint256 amount) external onlyOwner {
        require(IERC20(_token).transfer(owner(), amount), "Withdraw failed");
    }
}
