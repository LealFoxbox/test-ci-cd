#!/usr/bin/env bash
echo "Installing tools and setting env variables"

gem install cocoapods-user-defined-build-types

(echo $ENV_CONTENT | base64 --decode) > .env

BUILD_VERSION="com.orangeqc.app"
VERSION_NUMBER=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)

if [ "$APP_ENV" == "staging" ]; then
  BUILD_VERSION="$BUILD_VERSION.staging"
fi;

RELEASE_VERSION="$BUILD_VERSION@$VERSION_NUMBER+$APPCENTER_BUILD_ID"
printf "\nSetting RELEASE_VERSION to .env: $RELEASE_VERSION"
printf "\nRELEASE_VERSION=$RELEASE_VERSION" >> .env
printf "\nBUILD_ID=$APPCENTER_BUILD_ID" >> .env
printf "\nAPP_ENV=$APP_ENV" >> .env

cat .env
