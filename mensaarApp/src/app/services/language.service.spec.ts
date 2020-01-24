import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Plugins } from '@capacitor/core';
const { Device } = Plugins;


describe('LanguageService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslateService]
    })
  });

  it('should be created', () => {
    const service: LanguageService = TestBed.get(LanguageService);
    expect(service).toBeTruthy();
  });

  it('translationService created', () => {
    const service: LanguageService = TestBed.get(LanguageService);
    let translationService = service.getTranslationService()
    expect(translationService).toBeTruthy()
  })

  it("set language", async () => {
    const service: LanguageService = TestBed.get(LanguageService);
    const lng1 = "de"
    const lng2 = "fr"
    let translationService = service.getTranslationService()
    let storageService = service.getStorageService()

    expect(translationService.getLangs()).toEqual([])
    expect(translationService.currentLang).toBeFalsy()
    expect(service.selected).toBeFalsy()

    service.setLanguage(lng1)
    expect(translationService.getLangs()).toEqual([lng1])
    expect(translationService.currentLang).toEqual(lng1)
    expect(service.selected).toEqual(lng1)
    let storedLangauge = await storageService.getStorage('SELECTED_LANGUAGE')
    expect(storedLangauge).toEqual(lng1)

    service.setLanguage(lng2)
    expect(translationService.getLangs()).toEqual([lng1, lng2])
    expect(translationService.currentLang).toEqual(lng2)
    expect(service.selected).toEqual(lng2)
    storedLangauge = await storageService.getStorage('SELECTED_LANGUAGE')
    expect(storedLangauge).toEqual(lng2)

  })

  it("set device language ", async () => {

    let deviceLng = await Device.getLanguageCode()
    const service: LanguageService = TestBed.get(LanguageService);

    service.getStorageService().removeStorage("SELECTED_LANGUAGE")
    await service.setInitialAppLanguage()

    expect(service.getLanguage()).toEqual(deviceLng.value.substring(0, 2))
  });
});
