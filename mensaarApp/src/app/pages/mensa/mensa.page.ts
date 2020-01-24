import { Component, OnInit, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Events } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MensaService } from '../../services/mensa.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastController } from '@ionic/angular';
import { LanguageService } from './../../services/language.service';

import { ModalController } from '@ionic/angular';
import { FoodFeedbackComponent } from '../../components/food-feedback/food-feedback.component';

import { StorageService } from './../../services/storage.service';

import { Plugins, PluginListenerHandle} from '@capacitor/core';
const { Network } = Plugins




@Component({
  selector: 'app-mensa',
  templateUrl: './mensa.page.html',
  styleUrls: ['./mensa.page.scss'],
})

export class MensaPage implements OnInit {
  networkListener: PluginListenerHandle;
  networkStatus = true;

  mensaId = null;
  menus: any;
  meals: any;
  currentDate: any;
  selectedDate: any;
  allFavoriteMeals: any;
  allergens: any;
  mensaName: String;
  openedCounters: boolean[] = new Array();
  areCountersOpened: boolean = true;
  mealDataProvided = false;
  loaded = false;
  networkPlugin: any;

  translationservice: any;
  feedbackTranslation: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private mensaService: MensaService,
    private changeDetector: ChangeDetectorRef,
    // translateService is required to implement the automatic translation of the dates in mensa.page.html
    private translateService: TranslateService,
    private storageService: StorageService,
    public modalController: ModalController,
    public events: Events,
    private toastController: ToastController,
    private languageService: LanguageService
  ) {
    this.networkPlugin = Network;
    // set on init the view with current date meal
    // When this event is fired, then the language was changed --> reload data.
    this.events.subscribe('language:changed', () => {
      if (this.networkStatus)
        this.reloadData();
    });
  }

  /**
   * Initializes the Mensa page
   */
  async ngOnInit() {
    this.networkStatus = (await Network.getStatus()).connected

    this.networkListener = Network.addListener('networkStatusChange', status => {
      this.networkStatus = status.connected
      if (this.networkStatus)
        this.reloadData()
        this.mensaName = this.mensaService.getMensaName(this.mensaId);
    })

    this.languageService.setInitialAppLanguage()
      // get translation Service from languageService.
      .then(() => this.languageService.getTranslationService())
      // store object reference
      .then(translationservice => this.translationservice = translationservice)
      // request translation data for feedback modal
      .then(() => this.translationservice.get('FOODALARM')
        .subscribe(feedbackTranslation => {
          this.feedbackTranslation = feedbackTranslation;
        }));

    await this.storageService.getFavoriteMeals().then(result => {
      this.allFavoriteMeals = result;
    });
    this.mensaId = this.activatedRoute.snapshot.paramMap.get('mensaId');

    if (this.networkStatus) {

      
      //need to subscribe to baseData to get list of allergens
      this.dataService.getBaseData().subscribe(data => {
        this.allergens = data["notices"]
      });
      this.mensaName = this.mensaService.getMensaName(this.mensaId);

      

      // get Mensa Data containing the meals and counter information
      await this.dataService.getMensaData(this.mensaId).subscribe(async data => {
        if (data['days'].length > 0) {
          this.mealDataProvided = true;
          this.menus = data["days"]
          let dateNow = new Date();
          dateNow.setHours(1, 0, 0, 0);
          this.currentDate = dateNow.toISOString();
          let element = this.menus.filter(item => item.date === this.currentDate)[0];
          if (!element) {
            this.selectedDate = this.menus[0].date;
            this.meals = this.menus[0].counters;
            this.checkFavoriteMealsServed(this.meals);
          }
          else {
            this.selectedDate = this.currentDate;
            this.meals = element.counters;
            this.checkFavoriteMealsServed(this.meals);
          }
          this.updateOpenedCounters()
        } else {
          this.mealDataProvided = false;
        }

        this.loaded = true;
      });

    }

  }

  ionViewWillEnter() {
    this.storageService.getFavoriteMeals().then(result => {
      this.allFavoriteMeals = result;
    });
  }


  /** 
   * Function for display toast message with duration
   */
  async presentToast(mymessage: string, myduration: number, myheader: string) {
    const toast = await this.toastController.create({
      position: 'bottom',
      message: mymessage,
      duration: myduration,
      header: myheader,
      color: 'primary',
    });
    toast.present();
  }


  /**
  * Check if the favorized meals are served
  */
   async checkFavoriteMealsServed(meals: any) {
    let allMeals = [];
    let mealMessage = '';

    if (this.allFavoriteMeals && this.allFavoriteMeals[this.mensaId]) {
      meals.forEach(async (meal) => {
        meal.meals.forEach(async (singleMeal) => {
          if (this.allFavoriteMeals[this.mensaId].includes(singleMeal.name)) {
            allMeals.push(singleMeal.name);
          }
        });
      });
      mealMessage = allMeals.join(', ');
      await this.storageService.getFoodAlarmStatus().then(async answer => {
        if (answer) {
          if (allMeals.length > 0) {
            this.presentToast(
              this.feedbackTranslation.message + ': ' + mealMessage + '!',
              5000,
              this.feedbackTranslation.title
            );
          }
        }
      });
    }
  }

  /**
  * reloads the data, if the language is changed.
  */
  async reloadData() {
    this.loaded = false;
    let selectedDateOld = this.selectedDate;
    this.selectedDate = "";

    this.dataService.getBaseData().subscribe(data => {
      this.allergens = data["notices"]
    });

    this.dataService.getMensaData(this.mensaId).subscribe(data => {
      if (data['days'].length > 0) {
        this.mealDataProvided = true;
        this.menus = data["days"]
        let dateNow = new Date();
        dateNow.setHours(1, 0, 0, 0);
        this.currentDate = dateNow.toISOString();
        let element = this.menus.filter(item => item.date === this.currentDate)[0];
        if (!element) {
          this.selectedDate = this.menus[0].date;
          this.meals = this.menus[0].counters;
          this.checkFavoriteMealsServed(this.meals);
        }
        else {
          this.selectedDate = this.currentDate;
          this.meals = element.counters;
          this.checkFavoriteMealsServed(this.meals);
        }
        this.updateOpenedCounters()
      } else {
        this.mealDataProvided = false;
      }

      this.loaded = true;
    });
  }

  /**
   * shows modal, enables the user to give feedback to the corresponding meal
   * @param food: contains data specifying the food for which the user gives feedback
   * @param counterIdentifier: specifies the counter (f.e. "Komplett")
   */
  async presentFeedbackModal(food: any, counterIdentifier: string) {
    const modal = await this.modalController.create({
      component: FoodFeedbackComponent,
      componentProps: {
        date: this.selectedDate,
        counterId: counterIdentifier,
        knownMealId: food.knownMealId,
        mealName: food.name,
        mensaId: this.mensaId,
      },
      cssClass: 'food-modal',
    });
    return await modal.present();
  }


  /**
   * Changes the displayed meals when another day is selected.
   * @param ev Selected day.
   */
  async segmentChanged(ev: any) {
    this.selectedDate = ev.detail.value;
    let element = this.menus.filter(item => item.date === ev.detail.value)[0];
    if (element) {
      this.meals = element.counters;
    }

    this.updateOpenedCounters()
    this.changeDetector.detectChanges();

    // After switching the day, show food alarm again, if favorite meal is served
    this.checkFavoriteMealsServed(this.meals);

    // }
  }

  /**Check for a specific meal, if the meal is in the list of all favorite meals
  * In the HTML, every food list item will call this function, ans set the specific icon
  */
  isFavorite(foodname: string) {
    // Return false, if there is no favorite meal list existing yet
    if (!this.allFavoriteMeals) {
      return false;
    }
    // check if the meal is inside the list, to return true
    // first check, if specific mensa is already existing in list
    if (this.allFavoriteMeals[this.mensaId]) {
      if (this.allFavoriteMeals[this.mensaId].length > 0) {
        if (this.allFavoriteMeals[this.mensaId].includes(foodname)) {
          return true;
        }
      }
    }
    return false;
  }


  /**
   * Adds meal to favorites
   * @param ev 
   * @param foodname, name of the meal
   */
  doMealFavorite(ev: any, foodname) {

    // prevents feedback popover from being opened (popover is also in this click area)
    ev.stopPropagation();

    // Go to the storage service, and put the single meal inside the whole favorite meal list
    this.storageService.setFavoriteMeals(this.mensaId, foodname);
    // Only for see the logs in the console
    this.storageService.getFavoriteMeals().then(result => {
      this.allFavoriteMeals = result;
    });
  }

  /**
   * Removes one meal from the favorites
   * @param ev 
   * @param foodname, name of the meal
   */
  removeMealFavorite(ev: any, foodname) {

    // prevents feedback popover from being opened (popover is also in this click area)
    ev.stopPropagation();

    // Go to the storage service and remove on single food from the storage
    this.storageService.removeSingleMeal(this.mensaId, foodname);
    // Only for see the logs in the console
    this.storageService.getFavoriteMeals().then(result => {
      this.allFavoriteMeals = result;
    });
  }



  /**
   * Updates boolean Array of all opened Counters by comparing opening hours with current time 
  */
  updateOpenedCounters() {
    this.openedCounters.length = 0;
    let dateNow = new Date();

    for (var meal of this.meals) {
      this.openedCounters.push(this.checkIfOpened(meal["openingHours"], meal["feedback"], dateNow))
    }
    //check if array contains only false, to update variable
    if (this.openedCounters.every(elem => elem == false)) {
      this.areCountersOpened = false;
    } else {
      this.areCountersOpened = true;
    }
  }

  /**
   * reloads the data if the user clicks the "try again" button after internet connection problems
   */
  async tryAgain() {
    this.networkStatus = (await Network.getStatus()).connected
    if (this.networkStatus) {
      this.reloadData()
      this.mensaName = this.mensaService.getMensaName(this.mensaId);
    }
  }


  /**
   * Compare current time with opening hours
   * @param openingHours, Object from mensa api containing opening times
   * @param openingDates, Object to contain day on which meal is served
   * @param dateNow, current Date
  */
 checkIfOpened(openingHours: any, openingDates: any, dateNow: any) {
   
    let isOpen = false;
    let openingStart = new Date(openingHours["start"]);
    let openingEnd = new Date(openingHours["end"]);

    let openingDate = new Date(openingDates["start"])
   

    //check if day fits first, then check for start time
    if (dateNow.getDate() != openingDate.getDate()){
      isOpen = false;
    } else if (dateNow.getHours() >= openingStart.getUTCHours()) {
      if (dateNow.getHours() == openingStart.getUTCHours() && dateNow.getMinutes() < openingStart.getMinutes()) {
        isOpen = false;
      } else {
        //now that start time fits, check for end time
        if (dateNow.getHours() <= openingEnd.getUTCHours()) {
          if (dateNow.getHours() == openingEnd.getUTCHours() && dateNow.getMinutes() > openingEnd.getMinutes()) {
            isOpen = false;
          } else {
            //counter is open
            isOpen = true;
          }
        }
      }

    }
    return isOpen;
  }

  /** 
   * tests if a component is selected for Filtering
   * @param component
   */ testSingleComponent(component: any) {
    if (component in this.storageService.allergens) {
      if (this.storageService.allergens[component].isChecked) {
        return true;
      }
    }
    return false;
  }
}




