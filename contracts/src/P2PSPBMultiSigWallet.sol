// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title P2PSPB Multi-Sig Wallet
 * @dev Кошелёк с множественными подписями для settlement транзакций
 * 
 * Требует 2 из 3 подписей для транзакций > threshold
 * 
 * Owners:
 * - CEO (генеральный директор)
 * - CTO (технический директор)
 * - Compliance Officer (ответственный за compliance)
 */
contract P2PSPBMultiSigWallet {
    
    struct Transaction {
        uint256 id;
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) isConfirmed;
    }
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    uint256 public requiredConfirmations;
    uint256 public threshold; // Минимальная сумма для multi-sig (в wei)
    
    event TransactionSubmitted(uint256 indexed txId, address indexed owner, address indexed to, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }
    
    modifier txExists(uint256 _txId) {
        require(_txId < transactionCount, "Transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Transaction already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _txId) {
        require(!transactions[_txId].isConfirmed[msg.sender], "Transaction already confirmed");
        _;
    }
    
    /**
     * @dev Конструктор
     * @param _owners Адреса владельцев (обычно 3)
     * @param _requiredConfirmations Необходимое количество подтверждений (2 из 3)
     * @param _threshold Минимальная сумма для multi-sig (в wei)
     */
    constructor(
        address[] memory _owners,
        uint256 _requiredConfirmations,
        uint256 _threshold
    ) {
        require(_owners.length >= _requiredConfirmations, "Owners must be >= required confirmations");
        require(_requiredConfirmations > 0, "Required confirmations must be > 0");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Owner already exists");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        requiredConfirmations = _requiredConfirmations;
        threshold = _threshold;
    }
    
    /**
     * @dev Создать транзакцию
     * @param to Адрес получателя
     * @param value Сумма в wei
     * @param data Данные транзакции
     * @return txId ID транзакции
     */
    function submitTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) public onlyOwner returns (uint256 txId) {
        txId = transactionCount;
        transactions[txId].id = txId;
        transactions[txId].to = to;
        transactions[txId].value = value;
        transactions[txId].data = data;
        transactions[txId].executed = false;
        transactions[txId].confirmations = 0;
        
        // Если сумма меньше threshold или это не settlement, выполняем сразу
        if (value < threshold) {
            _executeTransaction(txId);
        } else {
            // Иначе требуем multi-sig
            confirmTransaction(txId);
        }
        
        transactionCount++;
        
        emit TransactionSubmitted(txId, msg.sender, to, value);
    }
    
    /**
     * @dev Подтвердить транзакцию
     * @param txId ID транзакции
     */
    function confirmTransaction(uint256 txId)
        public
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        notConfirmed(txId)
    {
        transactions[txId].isConfirmed[msg.sender] = true;
        transactions[txId].confirmations++;
        
        emit TransactionConfirmed(txId, msg.sender);
        
        // Если набрано достаточно подтверждений, выполняем
        if (transactions[txId].confirmations >= requiredConfirmations) {
            _executeTransaction(txId);
        }
    }
    
    /**
     * @dev Выполнить транзакцию
     * @param txId ID транзакции
     */
    function executeTransaction(uint256 txId)
        public
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(
            transactions[txId].confirmations >= requiredConfirmations,
            "Not enough confirmations"
        );
        
        _executeTransaction(txId);
    }
    
    /**
     * @dev Внутренняя функция выполнения транзакции
     * @param txId ID транзакции
     */
    function _executeTransaction(uint256 txId) internal {
        address to = transactions[txId].to;
        uint256 value = transactions[txId].value;
        bytes memory data = transactions[txId].data;
        
        transactions[txId].executed = true;
        
        (bool success, ) = to.call{value: value}(data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(txId);
    }
    
    /**
     * @dev Получить количество подтверждений транзакции
     * @param txId ID транзакции
     * @return Количество подтверждений
     */
    function getConfirmationCount(uint256 txId) public view txExists(txId) returns (uint256) {
        return transactions[txId].confirmations;
    }
    
    /**
     * @dev Проверить, подтверждена ли транзакция владельцем
     * @param txId ID транзакции
     * @param owner Адрес владельца
     * @return true если подтверждена
     */
    function isConfirmed(uint256 txId, address owner) public view txExists(txId) returns (bool) {
        return transactions[txId].isConfirmed[owner];
    }
    
    /**
     * @dev Получить список владельцев
     * @return Массив адресов владельцев
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    /**
     * @dev Получить баланс кошелька
     * @return Баланс в wei
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Добавить нового владельца (только для экстренных случаев)
     * @param owner Адрес нового владельца
     */
    function addOwner(address owner) public onlyOwner {
        require(owner != address(0), "Invalid address");
        require(!isOwner[owner], "Owner already exists");
        
        isOwner[owner] = true;
        owners.push(owner);
        
        emit OwnerAdded(owner);
    }
    
    /**
     * @dev Удалить владельца (только для экстренных случаев)
     * @param owner Адрес владельца для удаления
     */
    function removeOwner(address owner) public onlyOwner {
        require(owner != address(0), "Invalid address");
        require(isOwner[owner], "Owner does not exist");
        require(owners.length > requiredConfirmations, "Cannot remove owner");
        
        isOwner[owner] = false;
        
        // Удаляем из массива
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        
        emit OwnerRemoved(owner);
    }
    
    /**
     * @dev Изменить порог суммы для multi-sig
     * @param _threshold Новый порог (в wei)
     */
    function setThreshold(uint256 _threshold) public onlyOwner {
        threshold = _threshold;
    }
    
    // Получение ETH
    receive() external payable {}
}
