import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { FoodFeedbackComponent } from './food-feedback.component';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavParams, ModalController, AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { Observable } from 'rxjs';

let spy: any;

describe('FoodFeedbackComponent', () => {
  let component: FoodFeedbackComponent;
  let fixture: ComponentFixture<FoodFeedbackComponent>;

  let alertController: AlertController;
  let toastController: ToastController;

  let dataService: DataService;
  let modalController: ModalController;

  let injector: TestBed;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [FoodFeedbackComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: NavParams, useClass: MockNavParams },
        { provide: ModalController, useClass: MockModalController },
        { provide: AlertController, useClass: MockAlertController },
        { provide: ToastController, useClass: MockToastController },
        { provide: LanguageService, useClass: MockLanguageService },
        { provide: DataService, useClass: MockDataService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();

    injector = getTestBed();
    toastController = injector.get(ToastController);
    alertController = injector.get(AlertController);
    modalController = injector.get(ModalController);
    dataService = injector.get(DataService);


    fixture = TestBed.createComponent(FoodFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  it('toast controller', async () => {
    // console.log("-------- > check toast controller");
    spy = jasmine.createSpyObj('EgalWas', ['present']);
    await component.presentToast('information', 100);
    expect(spy.present).toHaveBeenCalled();
    // console.log("-------- > check toast controller end");
  });

  it('close modal', () => {
    spyOn(modalController, 'dismiss');
    component.close();
    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('invalid feedback 1: send feedback without setting any data', async () => {
    // console.log('--->send feedback');
    spy = jasmine.createSpyObj('EgalWas', ['present']);
    component.feedbackTextField.value = '';
    await component.sendFeedback();
    expect(spy.present).toHaveBeenCalled();
  });


  it('valid feedback 1', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');
    component.feedbackTextField.value = 'message';
    await component.sendFeedback();
    expect(dataService.postRequest).toHaveBeenCalled();
    expect(alertController.create).not.toHaveBeenCalled();
  });

  it('valid feedback 2', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');
    component.rate(2);
    component.feedbackTextField.value = '';
    await component.sendFeedback();
    expect(dataService.postRequest).toHaveBeenCalled();
    expect(alertController.create).not.toHaveBeenCalled();
  });

  it('valid feedback 3', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');
    component.feedbackTextField.value = '';
    const ev = { 'currentTarget': { 'checked': false } };
    await component.addValue(ev, 'köstlich', 0, 0);
    // console.log('------------------<-------------------- ');
    // console.log(component.checkedOptions);
    expect(component.checkedOptions.size).toEqual(1);

    await component.sendFeedback();
    expect(dataService.postRequest).toHaveBeenCalled();
    expect(alertController.create).not.toHaveBeenCalled();
  });

  it('select option twice', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');
    component.feedbackTextField.value = '';
    let ev = { 'currentTarget': { 'checked': false } };
    await component.addValue(ev, 'köstlich', 0, 0);
    // console.log(component.checkedOptions);
    expect(component.checkedOptions.size).toEqual(1);

    ev = { 'currentTarget': { 'checked': true } };
    await component.addValue(ev, 'köstlich', 0, 0);
    expect(component.checkedOptions.size).toEqual(0);
  });


  it('valid feedback 4: all data given', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');
    component.feedbackTextField.value = 'blabla\n köstliches essen';
    const ev = { 'currentTarget': { 'checked': false } };
    component.addValue(ev, 'köstlich', 0, 0);

    await component.sendFeedback();
    expect(dataService.postRequest).toHaveBeenCalled();
    expect(alertController.create).not.toHaveBeenCalled();
  });


  it('change star rating', async () => {
    spyOn(alertController, 'create');
    spyOn(dataService, 'postRequest');

    component.rating = 10;
    component.rate(2);
    expect(component.rating).toEqual(2);
    expect(component.ratingDone).toEqual(true);
  });

  it('valid feedback 5, but server error', async () => {
    spy = jasmine.createSpyObj('EgalWas', ['present']);
    component.rate(2);
    component.feedbackTextField.value = '';
    await component.sendFeedback();
    expect(spy.present).toHaveBeenCalled();
  });

});

class MockNavParams {
  testData = {
  };

  get(param) {
    return this.testData[param];
  }
}

class MockLanguageService {
  getLanguage() { return 'de'; }
  setInitialAppLanguage() { return new Promise((resolve, reject) => { resolve(); }); }
  getTranslationService() { return new Promise((resolve, reject) => { resolve(new MockTranslateService()); }); }
}

class MockDataService {
  baseUrl: any;
  private http: any;
  languageService: any;
  getBaseData() { }
  getMensaData() { }
  postRequest(param1, param2, callback1, callback2) { callback1(); callback2({ 'error': { 'error': 2, 'description': 'test error' } }); }
}

class MockTranslateService {
  get(indentifier: string) {
    const retData = {
      'OPTIONS': {
        "delicious": "köstlich",
        "little": "zu wenig",
        "sweet": "zu süß",
        "salty": "zu salzig",
        "expensive": "zu teuer",
        "fat": "zu fettig",
        "spicy": "zu scharf",
        "bland": "zu fade"
      }
    };
    return new Observable(observer => { observer.next(retData); });
  }
}



class MockAlertController {
  create(data) {
    return spy;
  }
}
class MockToastController {
  create(data) {
    return spy;
  }
}

class MockModalController {
  dismiss() { }
}

class Dummy {
  checked = true;
}
class Option {
  currentTarget = new Dummy();
}
