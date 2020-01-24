import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { MensaService } from 'src/app/services/mensa.service';

@Component({
  selector: 'app-favorite-food',
  templateUrl: './favorite-food.page.html',
  styleUrls: ['./favorite-food.page.scss'],
})
export class FavoriteFoodPage implements OnInit {

  favoriteFoods: Array<any>;
  constructor(private storageService: StorageService, private translateService: TranslateService, private mensadata: MensaService) { }

  /**
   * Initialization of Favorite Food Page
   */
  async ngOnInit() {
    this.getMensaName('sb');
    // Initialize the empty food array
    this.favoriteFoods = [];

    /**
     * Gets the current food from the storage as object after initializing the page
     * @return array with food as objects
     */
    await this.storageService.getFavoriteMeals().then( async answer => {
        if (answer) {
            // converts the object from the storage
            Object.keys(answer).map((key) => {
                const food = {
                    Mensa: key,
                    FoodName: answer[key],
                };
                // Push every single food into the array
                this.favoriteFoods.push(food);
                });
            // Return the array with the single food as objects
            return this.favoriteFoods;
        }
      });
  }

  /**
   * Removes the single food from the storage,
   * then gets the current food from the storage as object
   * @param mensa (string): search for a specific mensa in all stored foods
   * @param foodname (any): removes the food name from the specific mensa in the storage
   * @return array with food as objects
   */
  async unfavoriteFood(mensa: string, foodname: any) {
      await this.storageService.removeSingleMeal(mensa, foodname);
      await this.storageService.getFavoriteMeals().then( async answer => {
        // makes the array with all foods empty again
        this.favoriteFoods = [];
        // converts the object from the storage
        Object.keys(answer).map((key) => {
          const food = {
              Mensa: key,
              FoodName: answer[key],
          };
          // Push every single food into the array
          this.favoriteFoods.push(food);
        });
        // Return the array with the single food as objects
        return this.favoriteFoods;
      });
  }

  /**
   * For displaying a list with all mensa names, need to get the mensa names from the MensaService
   * @param mensaid (string): id for a specific mensa from the list of all favorite foods
   * @return name of the mensa as string
   */
  getMensaName(mensaid: string) {
      let name: string;
      this.mensadata.mensas.forEach( (mensa) => {
        // Get the mensa name which match the id
        if (mensaid === mensa.value) {
            name = mensa.text;
        }
      });
      return name;
  }

}
