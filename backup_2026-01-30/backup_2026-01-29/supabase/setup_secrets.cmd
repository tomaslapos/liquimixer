@echo off
REM ============================================
REM Nastavení Supabase Secrets pro LiquiMixer
REM Spustit z příkazové řádky
REM ============================================

cd /d "C:\Users\TomášLapos\Liquimixer"
set SUPABASE="C:\Program Files\Supabase CLI\supabase.exe"

echo.
echo === SMTP Nastaveni (Email) ===
%SUPABASE% secrets set SMTP_HOST=smtp.websupport.cz
%SUPABASE% secrets set SMTP_PORT=465
%SUPABASE% secrets set SMTP_USER=invoice@liquimixer.com
%SUPABASE% secrets set "SMTP_PASSWORD=%%)[$$6+Fo!]~Q,?lfN-1I"
%SUPABASE% secrets set EMAIL_FROM=invoice@liquimixer.com

echo.
echo === GP WebPay Nastaveni ===
%SUPABASE% secrets set GPWEBPAY_TEST_MODE=true
%SUPABASE% secrets set GPWEBPAY_PRIVATE_KEY_PASSWORD=111111
%SUPABASE% secrets set APP_BASE_URL=https://www.liquimixer.com

echo.
echo === HOTOVO ===
echo.
echo POZOR: Jeste je potreba rucne pridat tyto secrets pres Supabase Dashboard:
echo   - GPWEBPAY_PRIVATE_KEY (obsah souboru GPWebpay\test_key_base64.txt)
echo   - GPWEBPAY_GPE_PUBLIC_KEY (obsah souboru GPWebpay\gpe_public_key_base64.txt)
echo.
echo Pote spustte deploy:
echo   %SUPABASE% functions deploy gpwebpay
echo   %SUPABASE% functions deploy invoice
echo   %SUPABASE% functions deploy idoklad
echo.
pause
