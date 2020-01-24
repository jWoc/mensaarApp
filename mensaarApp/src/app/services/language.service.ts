import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
import { StorageService } from './storage.service';
// Capacitor Device Plugin
import { Plugins } from '@capacitor/core';
const { Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  selected = '';

  SELECTED_LANGUAGE = 'SELECTED_LANGUAGE';
  EN = "en";
  DE = "de";
  FR = "fr";

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService
  ) { }

  /** 
  * Sets the language at the start of the application either by the language setting of the device or by the language setting selected by the user
  **/
  async setInitialAppLanguage(): Promise<void> {

    await this.storageService.getStorage(this.SELECTED_LANGUAGE).then((setLanguage) => {
      if (setLanguage) {
        this.setLanguage(setLanguage);
      }
      else {
        Device.getLanguageCode().then((data) =>
          data.value.substring(0, 2)
        ).then((lngCode) => {
          if (lngCode == this.DE || lngCode == this.EN || lngCode == this.FR)
            this.setLanguage(lngCode);
          else // not possible to test because can't change device language in test
            this.setLanguage(this.EN)
        })
      }
    })
  };


  /**  
   * getter for translationService object
  */
  getTranslationService() {
    return this.translateService;
  }

  /** 
   *  getter for storageService object
  */
  getStorageService() {
    return this.storageService;
  }

  /** 
   *  getter for current language
  */
  getLanguage() {
    return this.selected;
  }

  /**
  * Gets the supported languages
  * @returns {{Array.<{text: String, value: String}>}}Supported languages as list
  **/
  getLanguages() {
    return [
      { text: 'English', value: this.EN },
      { text: 'Deutsch', value: this.DE },
      { text: 'Français', value: this.FR }
    ];
  }

  /** 
  * Sets the language in the application
  * @param lng
  **/
  setLanguage(lng) {
    this.translateService.use(lng);
    this.selected = lng;
    this.storageService.setStorage(this.SELECTED_LANGUAGE, lng);
  }
}
