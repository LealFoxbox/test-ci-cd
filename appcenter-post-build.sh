if [ "$AGENT_JOBSTATUS" = "Succeeded" ];  then
  printf "\nGenerating source maps"
  # source our .env file and export the variables to be used next by sentry
  cat $APPCENTER_SOURCE_DIRECTORY/.env
  eval $(grep -v '^#' $APPCENTER_SOURCE_DIRECTORY/.env | sed 's/^/export /')
  # end exporting
  npx react-native bundle --entry-file index.js --platform $APPCENTER_CURRENT_PLATFORM --dev false --bundle-output $APPCENTER_OUTPUT_DIRECTORY/index.android.bundle --sourcemap-output $APPCENTER_OUTPUT_DIRECTORY/index.android.bundle.map
  printf "\nCreating a Sentry release with id $RELEASE_VERSION"
  # Create a release
   yarn sentry-cli releases new -p "$SENTRY_PROJECT" "$RELEASE_VERSION"
   yarn sentry-cli releases set-commits --auto "$RELEASE_VERSION" --log-level debug
   yarn sentry-cli releases files $RELEASE_VERSION upload-sourcemaps $APPCENTER_OUTPUT_DIRECTORY/index.android.bundle* --dist $APPCENTER_BUILD_ID --rewrite --strip-common-prefix
   yarn sentry-cli releases finalize "$RELEASE_VERSION"
   yarn sentry-cli releases deploys "$RELEASE_VERSION" new -e "$APP_ENV"
   echo "Sentry release created"
fi
