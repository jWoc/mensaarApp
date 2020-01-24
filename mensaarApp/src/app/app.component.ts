import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { Router } from '@angular/router';
import { Events } from '@ionic/angular';

import { MenuController } from '@ionic/angular';

import { StorageService } from './services/storage.service';
import { LanguageService } from './services/language.service'
import { MensaService } from './services/mensa.service'
import { DataService } from './services/data.service'


import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import localeFR from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';

import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
import { StatusBarStyle, } from '@capacitor/core';

const { Browser } = Plugins;
const { Network } = Plugins;


const { StatusBar } = Plugins;

/**
 * Status Bar class to change color of Status Bar when manually switching on and off of the Dark Mode.
*/
export class StatusBarObject {
  /**
  * Changes the Color of the Statusbar to Dark or Light, depending on param
  * @param dark Boolean
  */
  setStatusBarToDark(dark: Boolean) {
    StatusBar.setStyle({
      style: dark ? StatusBarStyle.Dark : StatusBarStyle.Light
    });
  }
}


/**
 * App Component to control App, and definition of side menu properties.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  networkListener: PluginListenerHandle;
  networkStatus: boolean;

  languages = [];
  selectedLanguage = '';
  isHiddenMealSettings = true;
  isHiddenFiltering = true;

  mensas = []
  selectedMensa = '';
  foodAlarm: boolean;


  prefersDark = window.matchMedia('(prefers-color-scheme: dark)');


  brightnessModes = {
    "light": "Light Mode",
    "dark": "Dark Mode",
    "automatic": 'MENU.darkmodeAutomatic'
  };

  SHOW_ALLERGENS = "SHOW_ALLERGENS";
  SHOW_MEAL_COMPONENTS = "SHOW_MEAL_COMPONENTS";
  SHOW_PRICES = "SHOW_PRICES";
  SHOW_CLOSED_COUNTERS = "SHOW_CLOSED_COUNTERS";
  CHOSEN_BRIGHTNESS = "CHOSEN_BRIGHTNESS";

  BOOLEAN = "boolean";
  STRING = "string";
  statusBar: StatusBarObject;
  networkPlugin: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private router: Router,
    private events: Events,
    private languageService: LanguageService,
    public mensaService: MensaService,
    private menuController: MenuController,
    private storageService: StorageService,
    private dataService: DataService,

  ) {
    this.networkPlugin = Network;
    this.initializeApp();
  }

  /**
   * Set Food alarm values on initialization of app.
   */
  async ngOnInit() {
    this.networkStatus = (await Network.getStatus()).connected

    this.networkListener = Network.addListener('networkStatusChange', status => {
      this.networkStatus = status.connected
      if (this.networkStatus)
        this.mensas = this.mensaService.getMensas()
      this.updateAllergens();
    })

    await this.storageService.getFoodAlarmStatus().then(answer => {
      this.foodAlarm = answer;
    });

    if (this.foodAlarm === null) {
      this.foodAlarm = true;
      this.storageService.setFoodAlarmStatusStorage(this.foodAlarm);
    }
  }


  /**
   * Initializes the App.  
   * Loads and sets the application language selected by the user and
   * loads and sets all meal settings when starting the app, sa well as brightness setting. 
   */
  initializeApp() {
    this.platform.ready().then(() => {
      //since statusbar only works on mobile devices, only initialize object if thats the case.
      if (this.isMobilePlatform()) {
        this.statusBar = new StatusBarObject();
      }

      return this.setInitialBrightnessMode()
    }).then(() => {
      return this.languageService.setInitialAppLanguage()
    }).then(() => {
      this.languages = this.languageService.getLanguages();
      this.selectedLanguage = this.languageService.getLanguage();
      registerLocaleData(localeDE, 'de');
      registerLocaleData(localeEn, 'en');
      registerLocaleData(localeFR, 'fr');

      return this.mensaService.setInitialAppMensa()
    }).then(() => {
      this.mensas = this.mensaService.getMensas()
      this.selectedMensa = this.mensaService.selected;

      // take all allergens from server and save them in case filtering is desired
      this.updateAllergens();

      // when the user has a favourit mensa then route to this
      // else route to standard home view (all mensas)
      if (this.mensaService.selected) {
        if (this.mensaService.selected != "none") {
          let mensaInitialRoute = "mensa/" + this.selectedMensa;
          this.router.navigateByUrl(mensaInitialRoute)
        }
        else
          this.router.navigateByUrl("home")
      }


      //Load values from storage
      return this.storageService.getStorage(this.SHOW_MEAL_COMPONENTS)
    }).then((data) => {
      // check if null or boolean (true or false)
      if (typeof (data) == this.BOOLEAN) { this.storageService.showMealComponents = Boolean(data); }
      return this.storageService.getStorage(this.SHOW_ALLERGENS)
    }).then((data) => {
      if (typeof (data) == this.BOOLEAN) { this.storageService.showAllergens = Boolean(data); }
      return this.storageService.getStorage(this.SHOW_PRICES)
    }).then((data) => {
      if (typeof (data) == this.BOOLEAN) { this.storageService.showPrices = Boolean(data); }
      return this.storageService.getStorage(this.SHOW_CLOSED_COUNTERS)
    }).then((data) => {
      if (typeof (data) == this.BOOLEAN) { this.storageService.showClosedCounters = Boolean(data); }
      return this.storageService.getStorage(this.CHOSEN_BRIGHTNESS)
    }).then((data) => {
      if (typeof (data) == this.STRING) { this.storageService.chosenBrightness = (data); }
        console.log('%c** Initialization completed successfully **', 'background: #222; color: green');
    });
  }

  /**
   * Hides the main menu.
   */
  hideMenu() {
    this.menuController.close();
  }

  /**
   * Shows or hides the meal settings in the main menu.
   */
  toggleMealSettings() {
    this.isHiddenMealSettings = !this.isHiddenMealSettings;
  }

  /**
   * Checks if the Platform that the app is running on is mobile or desktop
   * @returns boolean if its mobile 
   */
  isMobilePlatform() {
    let mobile = false;
    if ((this.platform.is("desktop") || this.platform.is("mobileweb")) == false) {
      mobile = true;
    } return mobile
  }


  /**
   * Definition of dark Mode listener, used  to change dark mode automatically.
   */
  darkModeListener = (mediaQuery) => {
    if (this.isMobilePlatform()) {
      this.statusBar.setStatusBarToDark(mediaQuery.matches);
    }
    this.setDarkTheme(mediaQuery.matches);
  };

  /**
   * Sets the dark theme to param.
   * @param shouldAdd boolean
   */
  setDarkTheme(shouldAdd: boolean) {
    if (this.isMobilePlatform()) {
      this.statusBar.setStatusBarToDark(shouldAdd);
    }
    document.body.classList.toggle('dark', shouldAdd);
    this.hideMenu();
  }

  /**
   * Sets new Brightness mode in storage and calls update function, selected by the user. 
   * @param ev 
   */
  selectBrightnessMode(ev: any) {
    let mode = ev.detail.value;

    this.storageService.setStorage(this.CHOSEN_BRIGHTNESS, mode)

    this.updateBrightnessMode(mode)
    this.storageService.chosenBrightness = mode
  }


  /**
   * Updates brigthness mode based on value in storage.
   * @param string, stating new modus ('dark', 'light', or 'automatic')
   */
  updateBrightnessMode(new_mode: string) {
    let mode_string = this.brightnessModes[new_mode]

    switch (mode_string) {
      case this.brightnessModes.light: {
        this.prefersDark.removeListener(this.darkModeListener);
        this.setDarkTheme(false);
        break;
      }
      case this.brightnessModes.dark: {
        this.prefersDark.removeListener(this.darkModeListener);
        this.setDarkTheme(true);
        break;
      }
      //Automatic switching as default
      default: {
        // Listen for changes to the prefers-color-scheme media query
        this.prefersDark.addListener(this.darkModeListener);
        this.setDarkTheme(this.prefersDark.matches);
        break;
      }
    }
  }

  /**
   * Toggles the filter settings.
   */
  toggleFilterSettings() {
    this.isHiddenFiltering = !this.isHiddenFiltering;
  }

  /**
   * Toggles the food alarm.
   */
  async toggleFoodAlarm() {
    await this.setFoodAlarm(this.foodAlarm);
    this.hideMenu();
  }

  /**
   * Sets food alarm status in storage based on param.
   * @param value boolean
   */
  async setFoodAlarm(value: boolean) {
    await this.storageService.setFoodAlarmStatusStorage(value);
    this.hideMenu();
  }


  /**
   * Sets the default mensa of the application selected by the user.
   * @param ev 
   */
  selectMensa(ev: any) {
    let home_path = "home";
    let mensa_base = "mensa/"

    let mensa = ev.detail.value
    this.mensaService.setMensa(mensa)
    if (mensa == "none")
      this.router.navigateByUrl(home_path)
    else {
      let mensaRoute = mensa_base + mensa;
      this.router.navigateByUrl(mensaRoute)
    }
    this.hideMenu();
  }

  /**
   * Sets the default language of the application selected by the user.
   * @param ev 
   */
  selectLanguage(ev: any) {

    let lng = ev.detail.value;
    this.languageService.setLanguage(ev.detail.value);

    // Fire event "language:changed" so that in home.page and mensa.page the data can be reloaded.
    this.events.publish('language:changed');
    this.updateAllergens();


    this.hideMenu();

  }

  /**
   * Saves a value from the mealsettings locally to retrieve the last setting of the user after a restart of the application.
   * @param val The mealsetting variable (SHOW_MEAL_COMPONENTS, SHOW_ALLERGENS, SHOW_PRICES, SHOW_CLOSED_COUNTERS) to be stored locally.
   */
  saveMealSetting(val: string) {
    if (val === this.SHOW_MEAL_COMPONENTS)
      this.storageService.setStorage(this.SHOW_MEAL_COMPONENTS, this.storageService.showMealComponents)
    if (val === this.SHOW_ALLERGENS)
      this.storageService.setStorage(this.SHOW_ALLERGENS, this.storageService.showAllergens)
    if (val === this.SHOW_PRICES)
      this.storageService.setStorage(this.SHOW_PRICES, this.storageService.showPrices)
    if (val === this.SHOW_CLOSED_COUNTERS)
      this.storageService.setStorage(this.SHOW_CLOSED_COUNTERS, this.storageService.showClosedCounters)

  }

  /**
   * Closes the meal setting so that it is closed again when the user reopens the main menu.
   */
  hideMealSetting() {
    if (!this.isHiddenMealSettings)
      this.isHiddenMealSettings = true;
  }

  /**
   * Updates the list of allergens, used when changing the language or starting the app
   */
  updateAllergens() {
    if (this.networkStatus) {

      this.dataService.getBaseData().subscribe(data => {
        var allergens = Object();
        let notices = data['notices'];

        for (const key in notices) {
          let value = notices[key];

          if (value['isAllergen']) {
            allergens[key] = { 'displayName': value['displayName'], 'isChecked': false };
            // check if there are any previous settings for the allergen
            this.storageService.getStorage(key).then((settings) => {
              if (typeof (settings) == this.BOOLEAN) {
                allergens[key] = { 'displayName': value['displayName'], 'isChecked': Boolean(settings) };
              }
              else {
                // default: allergen is not selected
                allergens[key] = { 'displayName': value['displayName'], 'isChecked': false };
              }
            });
          }
        };
        this.storageService.allergens = allergens;
      });
    }
  }

  /**
   * Saves a value from the filtersettings locally to retrieve the last setting of the user after a restart of the application.
   * @param key The key from which the setting(isChecked: true/false) should be stored locally.
   */
  saveFilterSettings(key: any) {
    let value = this.storageService.allergens[key]['isChecked'];
    this.storageService.setStorage(key, value);
  }

  /**
   * Opens Browser Window for Privacy Notice
   */
  async openPrivacyBrowser() {
    this.hideMenu();
    await Browser.open({ url: 'https://mensaar.de/#/privacy' });
  }


  /**
   * Sets the initial Brightness Mode for App by value in Storage, if none to automatic
   */
  async setInitialBrightnessMode(): Promise<void> {
    var that = this;

    await that.storageService.getStorage(this.CHOSEN_BRIGHTNESS).then((setMode) => {
      if (setMode) {
        that.updateBrightnessMode(setMode);
        that.storageService.chosenBrightness = setMode;
      }
      else {
        //if nothing in storage, use variable in chosenBrighness (default)
        that.storageService.setStorage(this.CHOSEN_BRIGHTNESS, this.storageService.chosenBrightness)
        that.updateBrightnessMode(this.storageService.chosenBrightness);
      }
    })
  }

}
