import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }

  getPageTitle() {
    return element(by.css('ion-title')).getText();
  }

  clickButton(sel: string) {
    const el = element.all(by.css(sel)).first();
    browser.wait(ExpectedConditions.elementToBeClickable(el));
    el.click();
  }
}
