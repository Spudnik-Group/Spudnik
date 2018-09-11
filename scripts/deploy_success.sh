#!/usr/bin/env bash
if ["${TRAVIS_TAG}" = "false"]; then
	echo 'Sending Honeybadger Webhook';
	curl -g "https://api.honeybadger.io/v1/deploys?deploy[environment]=production&deploy[local_username]=Spudnik-Group&deploy[revision]=${TRAVIS_COMMIT:0:7}&deploy[repository]=https://github.com/Spudnik-Group/Spudnik&api_key=$HONEYBADGER_API_KEY"
fi