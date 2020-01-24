import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { TestBed, ComponentFixture, async, getTestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { AppComponent, StatusBarObject } from './app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StorageService } from './services/storage.service';
import { MensaService } from './services/mensa.service';
import { LanguageService } from './services/language.service';
import { DataService } from './services/data.service';
import { Observable } from 'rxjs';
import { MenuController, Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { StatusBarStyle, } from '@capacitor/core';
let spy: any;
let test: any;

describe('AppComponent', () => {

  let splashScreenSpy, platformReadySpy, platformSpy, platformIsMobileSpy;
  


  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let injector: TestBed;
  let storageService: StorageService;
  let mensaService: MensaService;
  let languageService: LanguageService;
  let dataService: DataService;
  let router: Router;
  let menuController: MenuController;
  let platform: Platform;



  beforeEach(async(() => {
   
    platformReadySpy = Promise.resolve();
    platformIsMobileSpy = { return: true }
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy, is: { platformIsMobileSpy } });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        TranslateService,
        { provide: Router, useClass: MockRouter },
        { provide: StorageService, useClass: StorageService },
        { provide: DataService, useClass: MockDataService },
        { provide: StatusBarObject, useClass: StatusBarObject },
        { provide: Platform, useValue: platformSpy },
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: LanguageService, useClass: LanguageService },
        { provide: MensaService, useClass: MensaService },
      ],
    }).compileComponents();

    injector = getTestBed();
    storageService = injector.get(StorageService);
    mensaService = injector.get(MensaService);
    dataService = injector.get(DataService);
    languageService = injector.get(LanguageService);
    mensaService = injector.get(MensaService);
    menuController = injector.get(MenuController);
    router = injector.get(Router);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    fixture.detectChanges();
  });


  it('closes the Menu', async () => {
    spyOn(menuController, 'close');
    component.hideMenu();
    expect(menuController.close).toHaveBeenCalledTimes(1);
  });


  it('toggles the meal settings in menu', async () => {
    component.isHiddenMealSettings = true;

    component.toggleMealSettings()
    expect(component.isHiddenMealSettings).toBeFalsy();

  });


  it('initializes statusbar if platform is mobile', async () => {
    component.isMobilePlatform = () => { return true }
    await component.initializeApp()
    expect(component.statusBar).toBeDefined();
  });

  it('does not initialize statusbar if platform is not mobile-> no statusbar available', async () => {
    component.isMobilePlatform = () => { return false }
    await component.initializeApp()
    expect(component.statusBar).toBeUndefined();
  });


  it('checks for platform on initialization in order to define Statusbar', async () => {
    spyOn(component, 'isMobilePlatform');
    await component.initializeApp();
    expect(component.isMobilePlatform).toHaveBeenCalled();
  });

  it('checks for platform when switching brightness mode', () => {
    spyOn(component, 'isMobilePlatform');
    spyOn(document.body.classList, 'toggle');
    spyOn(component, 'hideMenu');

    component.setDarkTheme(true)

    expect(component.isMobilePlatform).toHaveBeenCalledTimes(1);
    expect(document.body.classList.toggle).toHaveBeenCalledTimes(1);
    expect(component.hideMenu).toHaveBeenCalledTimes(1);
  });

  it('Network true: addeventlistener connected true', async () => {
    let testCalled = false;
    const buffer = component.networkPlugin.addListener;
    const getMensas = spyOn(component.mensaService, 'getMensas');
    component.networkPlugin.addListener = (a, b) => {
      testCalled = true;
      b({connected: true});
    };
    await component.ngOnInit();
    expect(testCalled).toEqual(true);
    expect(getMensas).toHaveBeenCalled();
    component.networkPlugin.addListener = buffer;
  });

  it('Network false: addeventlistener connected false', async () => {
    let testCalled = false;
    const buffer = component.networkPlugin.addListener;
    const getMensas = spyOn(component.mensaService, 'getMensas');
    component.networkPlugin.addListener = (a, b) => {
      testCalled = true;
      b({connected: false});
    };
    await component.ngOnInit();
    expect(testCalled).toEqual(true);
    expect(getMensas).not.toHaveBeenCalled();
    component.networkPlugin.addListener = buffer;
  });


  it('calls initial Brightness Mode', async () => {
    spyOn(component, 'setInitialBrightnessMode')

    await component.initializeApp();
    expect(component.setInitialBrightnessMode).toHaveBeenCalled();
  });

  it('sets initial Brightness Mode if value is in storage', async () => {
    spyOn(component, 'updateBrightnessMode');

    await storageService.setStorage(component.CHOSEN_BRIGHTNESS, "dark");
    await component.setInitialBrightnessMode();

    expect(component.updateBrightnessMode).toHaveBeenCalled();
    expect(component.updateBrightnessMode).toHaveBeenCalledWith("dark");
    expect(storageService.chosenBrightness).toEqual("dark");
  });

  it('sets initial Brightness Mode if no value is stored in storage', async () => {
    spyOn(component, 'updateBrightnessMode');
    spyOn(storageService, 'setStorage');

    await storageService.removeStorage(component.CHOSEN_BRIGHTNESS);
    await component.setInitialBrightnessMode();

    expect(storageService.setStorage).toHaveBeenCalled();
    expect(storageService.setStorage).toHaveBeenCalledWith(component.CHOSEN_BRIGHTNESS, "automatic");
    expect(component.updateBrightnessMode).toHaveBeenCalled();
    expect(component.updateBrightnessMode).toHaveBeenCalledWith("automatic");

  });

  it('stores and updates brightness mode entered by user', () => {
    spyOn(storageService, 'setStorage');
    spyOn(component, 'updateBrightnessMode');

    component.selectBrightnessMode({ 'detail': { 'value': 'dark' } })

    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
    expect(storageService.setStorage).toHaveBeenCalledWith(component.CHOSEN_BRIGHTNESS, 'dark');
    expect(storageService.chosenBrightness).toEqual('dark');

    expect(component.updateBrightnessMode).toHaveBeenCalledTimes(1);
  });


  it('updates brightness mode to dark', async () => {
    spyOn(component.prefersDark, 'removeListener');
    spyOn(component, 'setDarkTheme')
    spyOn(component, 'isMobilePlatform')

    let value = 'dark';

    component.updateBrightnessMode(value);
    expect(component.brightnessModes[value]).toEqual(component.brightnessModes.dark)

    expect(component.prefersDark.removeListener).toHaveBeenCalledTimes(1);
    expect(component.setDarkTheme).toHaveBeenCalledTimes(1);
    expect(component.setDarkTheme).toHaveBeenCalledWith(true);

  });

  it('updates brightness mode to light', () => {
    spyOn(component.prefersDark, 'removeListener');
    spyOn(component, 'setDarkTheme')
    spyOn(component, 'isMobilePlatform')

    let value = 'light';

    component.updateBrightnessMode(value);
    expect(component.brightnessModes[value]).toEqual(component.brightnessModes.light)

    expect(component.prefersDark.removeListener).toHaveBeenCalledTimes(1);
    expect(component.setDarkTheme).toHaveBeenCalledTimes(1);
    expect(component.setDarkTheme).toHaveBeenCalledWith(false);

  });

  it('updates brightness mode to automatic', () => {
    spyOn(component.prefersDark, 'addListener');
    spyOn(component, 'setDarkTheme')
    spyOn(component, 'isMobilePlatform')

    let value = 'automatic';

    component.updateBrightnessMode(value);
    expect(component.brightnessModes[value]).toEqual(component.brightnessModes.automatic)

    expect(component.prefersDark.addListener).toHaveBeenCalledTimes(1);
    expect(component.setDarkTheme).toHaveBeenCalledTimes(1);

  });

  it('toggles the filter settings in menu', async () => {
    component.isHiddenFiltering = true;
    component.toggleFilterSettings()
    expect(component.isHiddenFiltering).toBeFalsy();

  });


  it('toggles the Food Alarm', async () => {
    component.foodAlarm = false;
    spyOn(component, 'hideMenu');
    await component.toggleFoodAlarm();
    expect(component.hideMenu).toHaveBeenCalled();

    const answer = await storageService.getFoodAlarmStatus();

    if (answer) {
      test = answer;
    } else {
      test = false;
    }

    expect(test).toEqual(false);
  });

  it('sets Food Alarm to True', async () => {
    await component.setFoodAlarm(true);
    const answer = await storageService.getFoodAlarmStatus();
    if (answer) {
      test = answer;
    } else {
      test = false;
    }

    expect(test).toEqual(true);
  });

  it('sets Food Alarm to False', async () => {
    await component.setFoodAlarm(false);
    const answer = await storageService.getFoodAlarmStatus();
    if (answer) {
      test = answer;
    } else {
      test = false;
    }
    expect(test).toEqual(false);
  });

  it('selects a Mensa', async () => {
    spyOn(mensaService, 'setMensa');
    await component.selectMensa({ 'detail': { 'value': 'sb' } });
    expect(mensaService.setMensa).toHaveBeenCalledTimes(1);
  });

  it('selects no Mensa', async () => {
    spyOn(mensaService, 'setMensa');
    await component.selectMensa({ 'detail': { 'value': 'none' } });
    expect(mensaService.setMensa).toHaveBeenCalledTimes(1);
  });

  it('selects a Language', async () => {
    spyOn(languageService, 'setLanguage');
    await component.selectLanguage({ 'detail': { 'value': 'de' } });
    expect(languageService.setLanguage).toHaveBeenCalledTimes(1);
  });

  it('saves Meal Settings: Show Meal Components', async () => {
    spyOn(storageService, 'setStorage');
    await component.saveMealSetting(component.SHOW_MEAL_COMPONENTS);
    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
  });

  it('saves Meal Settings: Show Allergens', async () => {
    spyOn(storageService, 'setStorage');
    await component.saveMealSetting(component.SHOW_ALLERGENS);
    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
  });

  it('saves Meal Settings: Show Prices', async () => {
    spyOn(storageService, 'setStorage');
    await component.saveMealSetting(component.SHOW_PRICES);
    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
  });

  it('saves Meal Settings: Show Closed Counters', async () => {
    spyOn(storageService, 'setStorage');
    await component.saveMealSetting(component.SHOW_CLOSED_COUNTERS);
    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
  });

  it('checks saved Meal Settings: Show Meal Components', async () => {
    storageService.showMealComponents = true;
    await component.saveMealSetting(component.SHOW_MEAL_COMPONENTS);
    let setting: boolean;
    await storageService.getStorage(component.SHOW_MEAL_COMPONENTS).then((data) => {
      setting = Boolean(data);
    }); await expect(setting).toEqual(true);

  });

  it('checks saved Meal Settings: Show Allergens', async () => {
    storageService.showAllergens = true;
    await component.saveMealSetting(component.SHOW_ALLERGENS);
    let setting: boolean;
    await storageService.getStorage(component.SHOW_ALLERGENS).then((data) => {
      setting = Boolean(data);
    });
    await expect(setting).toEqual(true);
  });
  it('checks saved Meal Settings: Show Prices', async () => {
    storageService.showPrices = true;
    await component.saveMealSetting(component.SHOW_PRICES);
    let setting: boolean;
    await storageService.getStorage(component.SHOW_PRICES).then((data) => {
      setting = Boolean(data);
    });
    await expect(setting).toEqual(true);
  });

  it('checks saved Meal Settings: Show Closed Counters', async () => {
    storageService.showClosedCounters = true;
    await component.saveMealSetting(component.SHOW_CLOSED_COUNTERS);
    let setting: boolean;
    await storageService.getStorage(component.SHOW_CLOSED_COUNTERS).then((data) => {
      setting = Boolean(data);
    });
    await expect(setting).toEqual(true);
  });


  it('hides Meal Settings', async () => {
    component.isHiddenMealSettings = false;
    component.hideMealSetting();
    expect(component.isHiddenMealSettings).toBeTruthy();
  });

  it('updates Allergens', async () => {
    await component.ngOnInit();
    await component.updateAllergens();
    expect(storageService.allergens).toBeDefined();
    expect(Object.keys(storageService.allergens).length).toEqual(5);
  });

  it('saves Filter settings', async () => {
    spyOn(storageService, 'setStorage');
    storageService.allergens['mq'] = { "displayName": "Macadamia nuts", "isChecked": true };
    await component.saveFilterSettings('mq');
    expect(storageService.setStorage).toHaveBeenCalledTimes(1);
  });

  it('checks saved filter setting value', async () => {

    storageService.allergens['mq'] = { "displayName": "Macadamia nuts", "isChecked": true };
    component.saveFilterSettings('mq');
    let setting: boolean;
    await storageService.getStorage('mq').then((data) => {
      setting = Boolean(data);
    });
    await expect(setting).toEqual(true);
  });

  it('opens Privacy Browser', async () => {
    spyOn(component, 'hideMenu');
    await component.openPrivacyBrowser();
    expect(component.hideMenu).toHaveBeenCalled();
  });

  // **************************************************************************************************
  class MockParamMap {
    get(identifier: string) {
      if (identifier === 'home') {
        return 'home';
      }
    }
  }

  class MockSnapshot {
    paramMap = new MockParamMap();
    constructor() { }
  }

  class MockRouter {
    snapshot = new MockSnapshot();
    constructor() { }
    navigateByUrl(url: string) { };
  }

  class MockDataService {
    baseUrl: any;
    private http: any;
    languageService: any;
    getBaseData() { return new Observable(observer => { observer.next(basedata) }); }
    getMensaData() { }
  }


  const basedata = {
    "locations":
    {
      "sb": {
        "displayName": "Mensa/Mensacafé Saarbrücken",
        "description": "Mensa and Mensacafé Saarbrücken are in building D4.1. It´s a listed building with a lot of interesting arts. Every day you can choose until thirteen different meals."
      },
      "hom": {
        "displayName": "Mensa Homburg",
        "description": "Mensa in Homburg and Cafete are in the area of the clinic centre of Saarland University , building 74. In our Mensa the guests can choose between 4 different meals for lunchtime."
      },
      "musiksb": {
        "displayName": "Cafeteria Hochschule für Musik Saar",
        "description": "This cafeteria is in the building of Hochschule für Musik und Theater. We offer you different  meals, cake, snacks and drinks every day during semester."
      },
      "htwgtb": {
        "displayName": "Cafeteria HTW Göttelborn",
        "description": "This Cafeteria is in the building of htw saar in Göttelborn. We offer you different  meals, cake, snacks and drinks every day during semester."
      },
      "mensagarten": {
        "displayName": "Mensagarden",
        "description": "Mensagarden ist in the area of  the meadow behind building A1.7 (former botanical garden). From monday till friday (11 – 15 o`clock)  we offer you every day choosing Pizza and Pasta on a nice place."
      },
      "htwcas": {
        "displayName": "Mensa HTW Saar CAS",
        "description": "The new cafeteria of htw saar is located in Building 10 on the Campus Alt-Saarbrücken.Our guests can choose between vegetarian and non-vegetarian meals. In addition, we also offer a self-service counter at noon. A salad bar,sandwiches and snacks are also available."
      },
      "htwcrb": {
        "displayName": "Mensa HTW Saar CRB",
        "description": "The cafeteria of htw saar Campus Rotenbühl can be found in building B in the basement. In the bright and friendly furnished rooms. Our guests can choose between two meals daily. In addition, we offer salad buffet where guests have variation of choice. Sandwiches, cold and hot drinks are also available. We invites you to relax on our outdoor terrace."
      }
    },
    "priceTiers": { "s": { "displayName": "Studenten" }, "m": { "displayName": "Bedienstete" }, "g": { "displayName": "Gäste" } },
    "knownMeals": { "gebfl": { "displayName": "Gebackener Fleischkäse" } },
    "notices": {
      "fs": { "displayName": "artificial colouring", "isAllergen": false, "isNegated": false },
      "wa": { "displayName": "Walnuts", "isAllergen": true, "isNegated": false },
      "kas": { "displayName": "Cashew nuts", "isAllergen": true, "isNegated": false },
      "pe": { "displayName": "Pecans", "isAllergen": true, "isNegated": false },
      "pi": { "displayName": "Pistachios", "isAllergen": true, "isNegated": false },
      "mq": { "displayName": "Macadamia nuts", "isAllergen": true, "isNegated": false }
    }
  };

});