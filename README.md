# Installion Guide
The final app is inside the mensaarApp folder and has all the Must-have-requirements as well as the May-have requirements implemented.

### Installion steps:
1.  clone the mensaarApp
2.  go to the root directory of the implementation
3.  run `npm install`    (node.js (version 6) must be installed)



# Run the App
To setup and run the App, follow the corresponding instructions:

## IOS
##### Setup the app:
You need MacOS and Xcode to run the app under iOS:
* enter mensaarApp folder, and then run:
* <code>ionic build</code>
* <code>ionic capacitor copy ios</code>
* <code>ionic capacitor open ios</code>

For more information, see: https://ionicframework.com/docs/building/ios

##### To run the app: 
* click on the left side on the folder "app"
* now go to the tab "Signing & Capabilities" and select a team and enter a bundle identifier
* now you can start the application either with an emulator or connected device with the key combination `cmd+R`

## Android: 
##### Setup the app:
* enter mensaarApp folder, and then run:
* <code>npm run build</code>
* <code>npx cap copy</code>
* <code>npx cap add android</code>
* <code>npx cap copy android</code> 
* <code>npx cap open android</code>

For more information about setting up android, see: https://capacitor.ionicframework.com/docs/basics/building-your-app/ <br>

Once that is done, proceed with: <br>
building the app in android studio

##### To run the app:
* run it in the emulator or
* use the <code>adb install <path to apk></code> command to install it on the phone 
* (phone needs to be connected to the computer) 

For more information, see: https://developer.android.com/studio/run <br> <br>

Please note that the app is designed for IOS, therefore some design might be suboptimal on android and some features might 
react a little bit buggy. <br>
(This can be fixed easily, but was not the focus and within the time frame of this project).   


## Webbrowser:
##### To run the app:
* Go to the root directory of the app
* run `ionic serve`  <br>
* After this step, the application is automatically started in the browser.

If <code>ionic serve</code> didn't work directly, execute the following command: <br>
`ionic state restore` and run `ionic serve` again.<br>

##### Developer Mode  <br>
To enter the Developer Mode, in most browsers pushing F12 works. <br>
There you can click on the phone icon and choose different phones to simulate. <br> 
After choosing a differnt phone, reload the page in order to apply this change, <br> <br>

Please note that the app is designed for IOS, therefore some design might be suboptimal in the webview and some features might 
react a little bit buggy. Also, the choice of the webbrowser can result in different performances. Chrome for example is usually a 
quite good choice. <br>
(But again, this was not the focus of the project).   


# Run the tests
##### Unit Tests
To run the unit tests of the app, go to the main folder of the app and on the first time, run <code> npm install </code>. <br>
Afterwards, run <code> npm test </code> and you will see the results after a while. <br>
Your browser will open and you can examine the results more closely.

##### Integration Test
To run the integration end-to-end tests, go to the main app folder of the app and on the first time, run <code> npm install </code>. <br>
Afterwards, run <code> npm run e2e</code> and you will see the results after a while. <br>
Please notice, that your browser will open, and run some actions in your app automatically.

# Change Language Translations
In this App, english, german and french is supported. In the implementation, we implemented the texts for following parts:
* All the Menu Settings
* The Menu options that are not names
* The header titles
* Information if data could not load 
* Information about the opening times of Mensas
* The Feedback
* The Favorite Food Page
* The Foodalarm

In order to change the translations of this text, go to <code> src/assets/i18n </code> and open the files:
* de.json
* en.json
* fr.json

In these files, the translation texts can be changed for each language. 
All the other translated data is reloaded dynamically from the API.