iex ((New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/appveyor/secure-file/master/install.ps1'))
./appveyor-tools/secure-file -decrypt ./config.zip.enc -secret $env:encrypt_secret

Write-Host '--- Extracting Assets... ---'
unzip ./config.zip -d ./config

npm install forever
forever start -c "npm start" ./