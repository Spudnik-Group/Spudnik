./appveyor-tools/secure-file -decrypt ./config.zip.enc -secret $encrypt_secret

unzip ./config.zip -d ./config

forever start -c "npm start" ./