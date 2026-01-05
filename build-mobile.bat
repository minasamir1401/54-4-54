@echo off
:: Change directory to the script's location
cd /d "%~dp0"

echo [1/3] Building Web Files...
call npm run build

echo [2/3] Syncing with Mobile Platforms...
call npx cap sync

echo [3/3] Done!
echo.
echo To generate APK: Open the 'android' folder in Android Studio and go to Build > Build APK.
echo To generate iOS app: You need a Mac with Xcode. Open the 'ios' folder in Xcode.
pause
