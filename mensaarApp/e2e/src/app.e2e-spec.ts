import { AppPage } from './app.po';
import { browser, element, by, ExpectedConditions } from 'protractor';

/*describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    
  });

  it('should be blank', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toContain('The world is your oyster.');
  });
});*/



describe('app', () => {
  let page: AppPage;

  beforeEach(() => {
    browser.get('/');
    page = new AppPage();
  });

  it('default title is "Mensas"', async () => {
    const title = await element(by.css('ion-title.homepage-title')).getText();
    expect(browser.getTitle()).toContain('Ionic App');
    expect(title).toContain('Mensas');
  });


  it('hide prices', async () => {

    await browser.driver.sleep(4000);
    // enter mensa sb
    await page.clickButton('ion-item.mensa-navigation');
    await browser.driver.sleep(500);


    // pries by default shown, check if they are listed
    let ic = await element(by.css('.priceCol'));
    let length = browser.executeScript('return arguments[0].children.length', ic);
    expect(length).toEqual(1);

    // open menu
    await browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    browser.driver.sleep(500);


    // open meal settings
    page.clickButton('ion-item.ion-meal-settings');
    browser.driver.sleep(500);

    // click on prices -> hide prices
    await browser.executeScript("document.querySelectorAll('.ion-meal-settings-list ion-item ion-checkbox')[2].click()");

    await browser.driver.sleep(500);
    // close menu again
    await browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    await browser.driver.sleep(500);


    ic = await element(by.css('.priceCol'));
    length = browser.executeScript('return arguments[0].children.length', ic);
    expect(length).toEqual(0);
    //browser.executeScript("return document.getElementsByTagName('ion-card').tagName", el).then((countComponents) => expect(countComponents).toEqual(123123));


    browser.driver.sleep(500);
  });

  /*it('hide allergenes', async () => {

    await browser.driver.sleep(3000);
    // enter mensa sb
    page.clickButton('ion-item.mensa-navigation');
    browser.driver.sleep(500);


    // allergens by default selected, check if they are listed
    const ic = await element(by.css('ion-list.component-list'));
    const length = browser.executeScript('return arguments[0].children.length', ic);
    expect(length).toEqual(3);

    // open menu
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    browser.driver.sleep(1000);


    // open meal settings
    page.clickButton('ion-item.ion-meal-settings');
    browser.driver.sleep(500);

    // click on show allergens -> hide allergens
    await browser.executeScript("document.querySelectorAll('.ion-meal-settings-list ion-item ion-checkbox')[1].click()");

    await browser.driver.sleep(500);
    // close menu again
    await browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    await browser.driver.sleep(500);

    const ic = await element(by.css('ion-list.component-list'));
    const length = browser.executeScript('return arguments[0].children.length', ic);
    expect(length).toEqual(3);
    //browser.executeScript("return document.getElementsByTagName('ion-card').tagName", el).then((countComponents) => expect(countComponents).toEqual(123123));


    browser.driver.sleep(500);
  });*/


  it('hide components', async () => {

    await browser.driver.sleep(3000);
    page.clickButton('ion-item.mensa-navigation');
    browser.driver.sleep(500);
    
    let components = await element(by.css('ion-card-content'));
    expect(components).toBeDefined();


    browser.driver.sleep(500);
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    page.clickButton('ion-item.ion-meal-settings');
    page.clickButton('.ion-meal-settings-list ion-item ion-checkbox');

    await browser.driver.sleep(500);
    await browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    await browser.driver.sleep(500);

    const ic = await element(by.tagName('ion-card'));
    const length = browser.executeScript('return arguments[0].children.length', ic);
    expect(length).toEqual(3);
    //browser.executeScript("return document.getElementsByTagName('ion-card').tagName", el).then((countComponents) => expect(countComponents).toEqual(123123));


    browser.driver.sleep(500);
  });


  /*it('hide allergenes', async () => {

    page.clickButton('ion-item.mensa-navigation');

    let components = await element(by.css('ion-card-content'));
    expect(components).toBeDefined();

    browser.driver.sleep(500);
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    page.clickButton('ion-item.ion-meal-settings');
    page.clickButton('.ion-meal-settings-list ion-item ion-checkbox');

    browser.driver.sleep(500);
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    browser.driver.sleep(1000);

    const countComponents = browser.executeScript("document.querySelectorAll('ion-card-content').length");

    expect(countComponents).toEqual(0);

    browser.driver.sleep(5000);
  });*/



  it('change language', async () => {
    browser.driver.sleep(500);
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
    browser.driver.sleep(500);
    let selectedLanguage = await element(by.css('ion-select.ion-select-language')).getAttribute('value');
    
    // set language  to german
    if (selectedLanguage !== 'de') {
      page.clickButton('ion-select.ion-select-language');
      browser.driver.sleep(500);


      //await (await element.all(by.css('ion-select.ion-select-language'))).entries()[1].click();
      browser.executeScript("document.querySelectorAll('ion-radio')[1].click()");
      browser.driver.sleep(500);

      browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");
      browser.driver.sleep(500);

      selectedLanguage = await element(by.css('ion-select.ion-select-language')).getAttribute('value');
      expect(selectedLanguage).toEqual('de');
    }

    browser.driver.sleep(500);

    page.clickButton('ion-select.ion-select-language');
    page.clickButton('ion-radio');

    browser.driver.sleep(500);

    selectedLanguage = await element(by.css('ion-select.ion-select-language')).getAttribute('value');
    expect(selectedLanguage).toEqual('en');

    browser.driver.sleep(500);

  });



  it('switch week day', async () => {

    page.clickButton('ion-item.mensa-navigation');
    browser.driver.sleep(500);

    const dateNow = new Date();
    dateNow.setHours(1, 0, 0, 0);
    if (dateNow.getDay() === 5) {
      dateNow.setDate(new Date().getDate() + 3);
    } else if (dateNow.getDay() === 6) {
      dateNow.setDate(new Date().getDate() + 2);
    } else {
      dateNow.setDate(new Date().getDate() + 1);
    }
    const newDate = dateNow.toISOString();

    page.clickButton('[ng-reflect-value="' + newDate + '"]');

    browser.driver.sleep(500);

    const selectedDate = await element(by.css('.segment-button-checked')).getAttribute('value');
    expect(selectedDate).toEqual(newDate);

    browser.driver.sleep(500);
  });




  it('select mensa, view opening hours, view meal plan, send anonymous feedback', async () => {

    page.clickButton('ion-item.mensa-navigation');

    browser.driver.sleep(500);
    let title = await element(by.css('ion-title.mensapage-title')).getText();
    expect(title).toContain('Mensa/Mensacafe Saar');

    page.clickButton('ion-card.meal-card');

    browser.driver.sleep(500);
    title = await element(by.css('ion-title.feedbackmodal-title')).getText();
    expect(title).toContain('Feedback');



    // enter feedback
    const inp = await element(by.css('ion-textarea textarea'));
    inp.sendKeys('das ist ein test, bitte ignorieren sie dieses feedback');


    // send feedback commented out to avoid spaming the cook
    // page.clickButton('send-feedback-button');

    browser.driver.sleep(500);
  });

  it('watch privacy notice', async () => {
    // page.clickButton('ion-menu-button.menu-button');
    browser.driver.sleep(500);
    browser.executeScript("document.querySelectorAll('ion-menu-button')[0].click()");

    page.clickButton('ion-item.privacy-notice-reference');

    browser.driver.sleep(500);
  });
  

});
