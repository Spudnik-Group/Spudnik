./appveyor-tools/secure-file -decrypt ./config.zip.enc -secret $encrypt_secret

unzip ./config.zip -d ./config

./node_modules/forever/binforever start -c "npm start" ./