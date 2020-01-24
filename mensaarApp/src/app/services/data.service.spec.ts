import { TestBed, getTestBed} from '@angular/core/testing';
import { DataService } from './data.service';
import { HttpClient} from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';



let mockLanguage = 'sb';

describe('DataService', () => {
  let injector: TestBed;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let service: DataService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {provide: LanguageService, useClass: MockLanguageService },
        DataService,
        TranslateService,
      ]
    });
    injector = getTestBed();
    service = injector.get(DataService);
    httpClient = injector.get(HttpClient);
    httpMock = injector.get(HttpTestingController);
    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test correct api url', () => {
    expect(service.baseUrl).toEqual('https://mensaar.de/api/2/TFtD8CTykAXXwrW4WBU4/1/');
  });

  it('postRequest check', () => {
    //console.log('---> start testing dataservice postrequest');
    const testPostData = { 'key': 20};
    const language = 'de';
    service.postRequest(language, testPostData, () => {
      // console.log('test postRequest: success callback: should not be executed');
    }, () => {
      // console.log('test postRequest: error callback: should not be executed');
    });

    const req = httpMock.expectOne(service.baseUrl + language + '/submitFeedback');
    expect(req.request.method).toBe('POST');
    //console.log('---> end testing dataservice postrequest');
  });


  it('get mensa data check', async () => {
    //console.log('---> start testing dataservice postrequest');
    mockLanguage = 'de';
    const mensa = 'sb';
    await service.getMensaData(mensa);
    expect(service).toBeTruthy();
  });

  it('base data', async () => {
    mockLanguage = 'de';
    await service.getBaseData();
    expect(service).toBeTruthy();
  });


  it('missing language', async () => {
    mockLanguage = null;
    const mensa = 'sb';
    await service.getMensaData(mensa);
    await service.getBaseData();
    expect(service).toBeTruthy();
  });

});


class MockLanguageService  {
  getLanguage() { return mockLanguage; }
}