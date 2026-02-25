// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PSPBToken
 * @dev ERC-20 токен для P2PSPB платформы
 * 
 * Функционал:
 * - Minting для наград майнерам/валидаторам
 * - Burning для уменьшения предложения
 * - Airdrop для первых пользователей
 * - Стиaking для валидаторов
 */
contract PSPBToken is ERC20, ERC20Burnable, Ownable {
    // Адрес контракта FeeSplitter для распределения комиссий
    address public feeSplitter;
    
    // Максимальное предложение (100 миллионов токенов)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // События
    event TokensMinted(address indexed to, uint256 amount);
    event FeeSplitterUpdated(address indexed oldAddress, address indexed newAddress);
    event AirdropClaimed(address indexed user, uint256 amount);
    
    // Airdrop конфигурация
    mapping(address => bool) public hasClaimedAirdrop;
    uint256 public airdropAmount = 1000 * 10**18; // 1000 токенов на пользователя
    uint256 public airdropPool;
    
    constructor() ERC20("P2PSPB Token", "PSPB") Ownable(msg.sender) {
        // Минтим 100 миллионов токенов для владельца
        // Распределение:
        // - 40% Airdrop и награды
        // - 30% Развитие платформы
        // - 20% Команда
        // - 10% Резерв
        _mint(msg.sender, MAX_SUPPLY);
        
        // Выделяем 10% на airdrop (10 миллионов токенов)
        airdropPool = MAX_SUPPLY / 10;
    }
    
    /**
     * @dev Установить адрес FeeSplitter контракта
     */
    function setFeeSplitter(address _feeSplitter) external onlyOwner {
        require(_feeSplitter != address(0), "Invalid address");
        emit FeeSplitterUpdated(feeSplitter, _feeSplitter);
        feeSplitter = _feeSplitter;
    }
    
    /**
     * @dev Минтинг новых токенов (только владелец)
     * Используется для наград валидаторам/майнерам
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Минтинг для наград валидаторам (только FeeSplitter)
     */
    function mintForValidator(address validator, uint256 amount) external {
        require(msg.sender == feeSplitter, "Only feeSplitter");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(validator, amount);
        emit TokensMinted(validator, amount);
    }
    
    /**
     * @dev Claim airdrop для новых пользователей
     * Можно_claimть только один раз
     */
    function claimAirdrop() external {
        require(!hasClaimedAirdrop[msg.sender], "Already claimed");
        require(airdropPool >= airdropAmount, "Airdrop pool empty");
        
        hasClaimedAirdrop[msg.sender] = true;
        airdropPool -= airdropAmount;
        
        _transfer(owner(), msg.sender, airdropAmount);
        emit AirdropClaimed(msg.sender, airdropAmount);
    }
    
    /**
     * @dev Сжигание токенов с комиссией
     */
    function burnWithFee(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // 5% комиссия за сжигание (идёт в feeSplitter)
        uint256 fee = (amount * 5) / 100;
        uint256 burnAmount = amount - fee;
        
        if (fee > 0 && feeSplitter != address(0)) {
            _transfer(msg.sender, feeSplitter, fee);
        }
        
        _burn(msg.sender, burnAmount);
    }
    
    /**
     * @dev Получить оставшийся airdrop pool
     */
    function getAirdropPool() external view returns (uint256) {
        return airdropPool;
    }
    
    /**
     * @dev Проверка, может ли пользователь claimить airdrop
     */
    function canClaimAirdrop(address user) external view returns (bool) {
        return !hasClaimedAirdrop[user] && airdropPool >= airdropAmount;
    }
}
