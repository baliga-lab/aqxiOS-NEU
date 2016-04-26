Requirements:

* npm: included with installation of NodeJS
* Apache Cordova: run `npm install -g cordova`
* Ionic CLI: run `npm install -g ionic`
* Android Studio which includes Android SDK Tools

Pre-compilation (macOS):

1. check the directory where Android SDK Tools are installed, by default it would be /Users/User/Library/Android/sdk
2. include SDK's tools and platform-tools directory to PATH by including the following line to ~/.bash_profile

        export PATH=${PATH}:/Users/User/Library/Android/sdk/platform-tools:/Users/User/Library/Android/sdk/tools

To compile:

1. at root project directory, run `ionic state restore`
4. run `ionic build android` which will create a new gradle project at platforms/android, the APK can be found in platforms/android/build/outputs/apk