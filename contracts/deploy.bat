@echo off
echo ============================================================
echo   P2PSPB Smart Contracts - Деплой в Sepolia Testnet
echo ============================================================
echo.

REM Проверка наличия .env
if not exist .env (
    echo [ERROR] Файл .env не найден!
    echo.
    echo Создайте файл .env и заполните:
    echo   SEPOLIA_RPC_URL=...
    echo   PRIVATE_KEY=...
    echo   ETHERSCAN_API_KEY=...
    echo.
    pause
    exit /b 1
)

REM Проверка PRIVATE_KEY
findstr /C:"PRIVATE_KEY=" .env | findstr /V "PRIVATE_KEY=$" >nul
if errorlevel 1 (
    echo [ERROR] PRIVATE_KEY не заполнен в .env!
    echo.
    echo Откройте .env и вставьте ваш Private Key от MetaMask
    echo.
    pause
    exit /b 1
)

echo [OK] Файл .env найден
echo.

REM Компиляция контрактов
echo ------------------------------------------------------------
echo   Шаг 1: Компиляция контрактов
echo ------------------------------------------------------------
call npx hardhat compile
if errorlevel 1 (
    echo [ERROR] Компиляция не удалась!
    pause
    exit /b 1
)
echo.

REM Деплой
echo ------------------------------------------------------------
echo   Шаг 2: Деплой контрактов в Sepolia
echo ------------------------------------------------------------
echo.
echo Это займёт 1-3 минуты...
echo.

call npm run deploy:sepolia

if errorlevel 1 (
    echo.
    echo [ERROR] Деплой не удался!
    echo.
    echo Возможные причины:
    echo   1. Недостаточно Sepolia ETH на балансе
    echo   2. Неверный Private Key
    echo   3. Проблемы с Infura API
    echo.
    echo Получите Sepolia ETH: https://sepoliafaucet.com
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Деплой успешно завершён!
echo ============================================================
echo.
echo Следующие шаги:
echo   1. Скопируйте адреса контрактов из вывода выше
echo   2. Вставьте их в .env файл
echo   3. Вставьте их в services/api/.env
echo   4. Вставьте их в apps/web/.env.local
echo.
echo После этого можно запускать Demo Mode!
echo.
pause
