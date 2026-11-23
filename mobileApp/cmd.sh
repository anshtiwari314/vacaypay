## to run on connected android 
npx expo run:android 


## to get an isolated apk without metro or expo server 
npx expo prebuild --platform android
npx expo run:android --variant release --no-bundler
cd android && ./gradlew assembleRelease
