import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ModalController, AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-food-feedback',
  templateUrl: './food-feedback.component.html',
  styleUrls: ['./food-feedback.component.scss'],
})
export class FoodFeedbackComponent implements OnInit {

  @Input() rating = 0;

  @Output() ratingChange: EventEmitter<number> = new EventEmitter();

  ratingDone = false;
  date: string;
  mealName: string;
  location: string;
  knownMealId: any;
  counterId: number;
  translationservice: any;
  feedbackTranslation: any;
  checkedOptions = new Set();

  @ViewChild('feedbackText', { static: false }) feedbackTextField: any;

  feedbackOptionsCols: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    private languageService: LanguageService,
    private dataService: DataService) {

    // get data passed to modal
    this.date = navParams.get('date');
    this.counterId = navParams.get('counterId');
    this.mealName = navParams.get('mealName');
    this.location = navParams.get('mensaId');
    this.knownMealId = navParams.get('knownMealId');

    /*console.log('>');
    // console.log(this.mealName);
    // console.log(this.location);
    // console.log('<');
    */

    // initiate translationService
    this.languageService.setInitialAppLanguage()
      // get translation Service from languageService. We need to submit on get method, therefore we need the translationService object
      .then(() => this.languageService.getTranslationService())
      // store object reference
      .then(translationservice => this.translationservice = translationservice)
      // request translation data for feedback modal
      .then(() => this.translationservice.get('FEEDBACK')
        .subscribe(feedbackTranslation => {
          this.feedbackTranslation = feedbackTranslation;
          const optionsDict = feedbackTranslation.OPTIONS;
          let counter = 0;
          // get the different checkbox options
          this.feedbackOptionsCols = [];
          for (const key of Object.keys(optionsDict)) {
            // options are shown in two pairs, therefore we create here an array containing several two pairs
            if ((counter % 2) === 0) {
              this.feedbackOptionsCols.push([optionsDict[key]]);
            } else {
              this.feedbackOptionsCols[Math.floor(counter / 2)].push(optionsDict[key]);
            }
            counter += 1;
          }
        }));
  }

  /**
   * opens an alert with the specified message
   **/
  async presentAlert(headerText: string, subHeaderText: string, information: string) {
    const alert = await this.alertController.create({
      header: headerText,
      subHeader: subHeaderText,
      message: information,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * shows a toast message with the specified message
   **/
  async presentToast(information: string, durationMS: number) {
    const toast = await this.toastController.create({
      message: information,
      duration: durationMS
    });
    toast.present();
  }

  /**
   * closes the modal
   **/
  close() {
    this.modalController.dismiss();
  }

  ngOnInit() { }

  /**
   * Sets the rating (stars between one and five indicated via index)
   **/
  rate(index: number) {
    this.rating = index;
    this.ratingDone = true;

    // change color of the stars depending on the selected star/rating
    this.ratingChange.emit(this.rating);
  }

  /**
   * Color of star is determined by the rating
   **/
  getColor(index: number) {
    if (this.isAboveRating(index)) {
      return '#E0E0E0';
    } else {
      return '#FFCA28';
    }
  }

  /**
   * help function to determine the position depending on the selected star/rating
   **/
  isAboveRating(index: number): boolean {
    return (index > this.rating);
  }

  /**
   * function which is executed on each checkbox action to determine the selected feedback options
   **/
  addValue(ev: any, feedbackOption: any, rowIndex: any, colIndex: any): void {
    if (!ev.currentTarget.checked) { // attention: inverted logic: if checked -> ev.currentTarget.checked = false
      this.checkedOptions.add(feedbackOption);
    } else {
      this.checkedOptions.delete(feedbackOption);
    }
  }

  /**
   * gathers the entered data (checkboxes, star rating, feedback text) and sends the data to the feedback server
   **/
  sendFeedback() {

    // get feedback text
    let feedbackText = this.feedbackTextField.value;
    // check if feedback was entered (either via text, star rating or checkboxes)
    if ((!feedbackText.trim()) && (this.rating === 0) && (this.checkedOptions.size === 0)) {
      // no feedback entered -> show alert
      this.presentAlert(
        this.feedbackTranslation.wrongInputTitle,
        this.feedbackTranslation.wrongInputSubTitle,
        this.feedbackTranslation.wrongInputMessage);
    } else {
      // feedback entered; combine feedback text and checkboxes (feedback sever supports only one feedback string)
      if (this.checkedOptions.size > 0) {
        if (feedbackText.trim()) {
          // add connector string
          feedbackText += '; ';
        }
        // add Checkbox information
        feedbackText += 'Checkboxes: ' + Array.from(this.checkedOptions).join(', ');
      }

      // post data keys as defined by the feedback server API
      let postData = {
        'location': this.location,          // example: "sb", "hom"
        'date': this.date,
        'knownMealId': this.knownMealId,    // most oftenly not set in API data
        'counterId': this.counterId,        // example: "Komplett", ...
        'mealName': this.mealName,
      };

      // add further optional data depending on what was set by the user
      if (this.rating > 0) {  // case star rating
        postData['rating'] = this.rating.toString();
      }
      if (feedbackText) {     // case feedback text entered
        postData['feedback'] = feedbackText;
      }

      // send data to the feedback server as post request;
      this.dataService.postRequest(this.languageService.getLanguage(), postData, successResponseData => {
        // in case of success, the modal window closes
        this.close();

        // open a toast to inform the user about the successful transmission
        this.presentToast(this.feedbackTranslation.successToast, 2000);
      }, errorResponse => {
        // case error during transmission / feedback server refuses submission
        this.presentAlert(this.feedbackTranslation.errorAlertTitle, errorResponse.error.error, errorResponse.error.description);
      });

    }
  }

}
