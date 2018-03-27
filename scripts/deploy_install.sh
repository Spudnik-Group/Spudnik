#!/usr/bin/env bash
cd ~/latest
unzip dist.zip -d ../Spudnik
cd ../Spudnik
npm install -g node-gyp
npm install