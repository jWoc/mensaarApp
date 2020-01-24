import { Injectable } from '@angular/core';
// Capacitor Storage Plugin
import { Plugins } from '@capacitor/core';
const { Storage} = Plugins

@Injectable({
  providedIn: 'root'
})
/**
* Provides a key-value store for simple data like user language settings in the local storage of the device.
* It uses the Storage Plugin from Capacitor https://capacitor.ionicframework.com/docs/apis/storage
**/
export class StorageService {

  showMealComponents = true;
  showPrices = true;
  showAllergens = false;
  showClosedCounters = true;
  chosenBrightness = 'automatic';
  darkMode = false;
  allergens = Object();
  foodAlarm: boolean;

  FAVORITE_MEALS = 'favorite-meals';
  FOOD_ALARM_STATUS = 'food-alarm-status';
  
  // The list with all favorite meals inside
  allFavoriteMeals: any;

  constructor() {
    // In the start of the app, get all favorite meals from the storage in the variable. If there is no storage, create an empty object.
    this.getFavoriteMeals().then( result => {
        if (result) {
            this.allFavoriteMeals = result;
        } else {
            this.allFavoriteMeals = {};
        }
    });

    // Get the current status for the food alarm from the storage
    this.getFoodAlarmStatus().then( answer => {
        this.foodAlarm = answer;

    });

  }

  /** 
  * Set a key value pair in native storage
  * @param key, key to object
  * @param value, value to certain key
  **/
  async setStorage(key: string, value: any): Promise<void> {
    await Storage.set({
      key: key,
      value: JSON.stringify(value)
    });
  };

  /** 
  * Get a value from a key from the native storage
  * @param key, key to object one wants to know the value of
  * @returns Value of the key - string
  **/
  async getStorage(key: string): Promise<string> {
    const item = await Storage.get({ key: key });
    if (item.value)
      return JSON.parse(item.value);
    else
      return undefined
  };
  
  /** 
  * Remove a key and its values from the native storage
  * @param key, key to object to remove
  **/ 
  async removeStorage(key: string): Promise<void> {
    await Storage.remove({
      key: key
    });
  };


  /** 
   *  Remove the whole "allFavoriteMeals" object with the key for the favorite meals from the storage
  */
  async removeFavoriteMeals() {
     await Storage.remove({ key: this.FAVORITE_MEALS });
  }

  /** Set a specific list to the object and store that list inside the allFavoriteMeals object 
   * and in storage with key 'favorite-meals' 
   * @param mensaid: key to store value
   * @param foodname: value to store
  */
  async setFavoriteMeals(mensaid: string, foodname: string) {
    // If the list contains not the specific mensa ID, initialize the list for that mensa
    if (!this.allFavoriteMeals[mensaid]) {
        this.allFavoriteMeals[mensaid] = [];
    }
    // If the list already includes that food, do NOT push it again inside the list of the specific mensa id
    if (!this.allFavoriteMeals[mensaid].includes(foodname)) {
        this.allFavoriteMeals[mensaid].push(foodname);
    }

    await Storage.set({
        key: this.FAVORITE_MEALS,
        value: JSON.stringify(this.allFavoriteMeals),
      });
  }

  /**
   * Return the whole favorite meals object from the storage with every mensa as list inside (if created)
   */
  async getFavoriteMeals() {
    const favoriteMeals = await Storage.get({ key: this.FAVORITE_MEALS });
    const result = JSON.parse(favoriteMeals.value);
    // console.log(result);
    return result;
  }

  /** 
   * Remove only one single meal from the list of the favorite meals for a specific mensa
   * @param mensaid, key to store 
   * @param foodname, name of the food
   */
  async removeSingleMeal(mensaid: string, foodname: string) {
    // If the list contains not the specific mensa ID, initialize the list for that mensa
    if (!this.allFavoriteMeals[mensaid]) {
        this.allFavoriteMeals[mensaid] = [];
    }
    // Search the specific meal and get the index from that meal in the list. With that index, the meal will be deleted from the list
    if (this.allFavoriteMeals[mensaid].includes(foodname)) {
        const index = this.allFavoriteMeals[mensaid].indexOf(foodname);
        this.allFavoriteMeals[mensaid].splice(index, 1);
    }

    // If there is no more food favorised for a specific mensa, delete the array from the object
    if (this.allFavoriteMeals[mensaid].length === 0) {
        delete this.allFavoriteMeals[mensaid];
    }

    // Set the new list (with the single food removed) to the storage again
    await Storage.set({
        key: this.FAVORITE_MEALS,
        value: JSON.stringify(this.allFavoriteMeals),
      });
  }


  /**
   * Saves the status for the food alarm in the storage
   * @param: status, if food alarm is set or not
   */ 
  async setFoodAlarmStatusStorage(status: boolean) {
    await Storage.set({
        key: this.FOOD_ALARM_STATUS,
        value: JSON.stringify(status),
      });
  }

  /** 
   * Get the current status of the food alarm from the storage
   * @returns value of Food alarm status
   */
  async getFoodAlarmStatus() {
    const foodAlarmStatus = await Storage.get({ key: this.FOOD_ALARM_STATUS });
    return JSON.parse(foodAlarmStatus.value);
  }

}
