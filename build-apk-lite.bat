@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo    LMINA APK BUILDER (LITE + FIXED)
echo ==========================================

rem 1. Force use the Java we found
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot"
set "PATH=!JAVA_HOME!\bin;!PATH!"

java -version >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] Java not found at redirected path.
    where java >nul 2>&1
    if !errorlevel! neq 0 (
        echo [!] Please install JDK 17 or 21.
        pause
        exit /b
    )
) else (
    echo [+] Using Java from: !JAVA_HOME!
)

rem 2. Search for Android SDK
set "SDK_PATH="

if not "%ANDROID_HOME%" == "" (
    set "SDK_PATH=%ANDROID_HOME%"
)

if "!SDK_PATH!" == "" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
    )
)

rem If still not found, try common locations
if "!SDK_PATH!" == "" (
    if exist "C:\Android\Sdk" set "SDK_PATH=C:\Android\Sdk"
)

if "!SDK_PATH!" == "" (
    echo [!] Android SDK not found (ANDROID_HOME is empty).
    echo [!] To build an APK locally, you MUST have the Android SDK installed.
    echo [!] You can download the 'Command line tools only' from the link below.
    echo [!] Link: https://developer.android.com/studio#command-line-tools-only
    start https://developer.android.com/studio#command-line-tools-only
    pause
    exit /b
)

set "ANDROID_HOME=!SDK_PATH!"
echo [+] Found Android SDK at: !ANDROID_HOME!

rem 3. Build Web Assets
echo [1/3] Building Web Files...
call npm run build
if !errorlevel! neq 0 (
    echo [!] Web build failed.
    pause
    exit /b
)

rem 4. Sync Capacitor
echo [2/3] Syncing Capacitor...
call npx cap sync android
if !errorlevel! neq 0 (
    echo [!] Capacitor sync failed.
    pause
    exit /b
)

rem 5. Build APK via Gradle
echo [3/3] Building APK...
cd android
if not exist gradlew.bat (
    echo [!] gradlew.bat missing in android folder.
    pause
    exit /b
)

call gradlew.bat assembleDebug

if !errorlevel! equ 0 (
    echo.
    echo ==========================================
    echo [+] SUCCESS! APK generated at:
    echo android\app\build\outputs\apk\debug\app-debug.apk
    echo ==========================================
    if exist "app\build\outputs\apk\debug" start explorer "app\build\outputs\apk\debug"
) else (
    echo.
    echo [!] Build FAILED. Check the errors above.
)

pause
