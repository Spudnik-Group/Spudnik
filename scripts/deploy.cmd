@echo off

:: ----------------------
:: KUDU Deployment Script
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_COMMAND (
  :: Install kudu sync
  echo ---Installing Kudu Sync---
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_COMMAND=node "%appdata%\npm\node_modules\kuduSync\bin\kuduSync"
)

echo '--------'
call pwd
echo '--------'

:: Install forever
call npm install forever -g --silent

:: Decrypt and unzip assets
call "./appveyor-tools/secure-file" -decrypt "./config.zip.enc" -secret %encrypt_secret%
call unzip "./config.zip" -d "./config"

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

echo ---Handling node.js deployment---

:: 1. Kill Previous Process
call node "%appdata%\npm\node_modules\forever\bin\forever" stopall

:: 2. KuduSync
echo Kudu Sync from "%DEPLOYMENT_SOURCE%\nodejs" to "%DEPLOYMENT_TARGET%"
call %KUDU_SYNC_COMMAND% -q -f "%DEPLOYMENT_SOURCE%\nodejs" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.deployment;deploy.cmd" 2>nul
IF !ERRORLEVEL! NEQ 0 goto error

:: 3. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd %DEPLOYMENT_TARGET%
  call npm install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)

:: 4. Start App
pushd %DEPLOYMENT_TARGET%
call node "%appdata%\npm\node_modules\forever\bin\forever" start -c "npm start" ./

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

goto end

:error
echo An error has occured during web site deployment.
exit /b 1

:end
echo Finished successfully.
