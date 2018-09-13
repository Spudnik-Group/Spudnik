#!/usr/bin/env bash
if ["$TRAVIS_TAG" = "false"]; then
	if ["$TRAVIS_BRANCH" == "staging"]; then
		ACCESS_TOKEN = $STAGING_ACCESS_TOKEN
		COMMENT = "staging build"
	fi
	if ["$TRAVIS_BRANCH" == "master"]; then
		ACCESS_TOKEN = $PRODUCTION_ACCESS_TOKEN
		COMMENT = "production build"
	fi
	echo 'Sending RollBar Webhook';
	REVISION=${TRAVIS_COMMIT:0:7}

	curl https://api.rollbar.com/api/1/deploy/ \
	-F access_token=$ACCESS_TOKEN \
	-F environment=$TRAVIS_BRANCH \
	-F revision=$REVISION \
	-F local_username="Spudnik-Group"
fi