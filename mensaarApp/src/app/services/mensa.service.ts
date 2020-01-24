import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

// Capacitor Device Plugin
import { Plugins } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class MensaService {
  selected = '';

  mensas = [
    { text: 'Mensa/Mensacafe Saar', value: 'sb' },
    { text: 'Homburg', value: 'hom' },
    { text: 'Hochschule Musik Saar', value: 'musiksb' },
    { text: 'HTW Göttelborn', value: 'htwgtb' },
    { text: 'Mensagarten', value: 'mensagarten' },
    { text: 'HTW Saar CAS', value: 'htwcas' },
    { text: 'HTW Saar CRB', value: 'htwcrb' },
    { text: 'MENSA.noFavorite', value: 'none' }
  ];

  SELECTED_MENSA = 'SELECTED_MENSA';
  NONE_MENSA = "none";

  constructor(
    private storageService: StorageService
  ) { }

  /** 
  * Sets the mensa at the start of the application by the favorite mensa selected by the user
  **/
  async setInitialAppMensa(): Promise<void> {
    var that = this;

    await that.storageService.getStorage(this.SELECTED_MENSA).then((setMensa) => {
      if (setMensa) {
        that.setMensa(setMensa);
        that.selected = setMensa;
      }
      else {
        that.setMensa(this.NONE_MENSA);
        that.selected = this.NONE_MENSA
      }
    })
  };

  /**
  * Gets the supported mensas
  * @returns {{Array.<{text: String, value: String}>}}Supported languages as list
  **/
  getMensas() {
    return this.mensas;
  }

  /**
   * Gets the Name of the mensa
   * @param mensaValue 
   */
  getMensaName(mensaValue) {
    const result = this.mensas.find(mensa => mensa.value === mensaValue);
    if (result)
      return result.text;
    else
      return this.NONE_MENSA; // should not happen
  }

  /** 
  * Sets the favourit mensa in the application
  * @param mensaName Name of the mensa
  **/
  setMensa(mensaName) {
    this.selected = mensaName;
    this.storageService.setStorage(this.SELECTED_MENSA, mensaName);
  }
}

