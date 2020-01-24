import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomePage } from './home.page';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';



describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  

  beforeEach(async(() => {


    TestBed.configureTestingModule({
      declarations: [ HomePage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [TranslateService,
        {provide: DataService, useClass: MockDataService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();


  }));

  it('should create', () => {
    
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  

  it('Network true: addeventlistener connected true', async () => {
    let testCalled = false;
    const buffer = component.networkPlugin.addListener;
    component.networkPlugin.addListener = (a, b) => {
      testCalled = true;
      b({connected: true});
    };
    await component.ngOnInit();
    expect(testCalled).toEqual(true);
    component.networkPlugin.addListener = buffer;
  });

  it('Network false: addeventlistener connected false', async () => {
    let testCalled = false;
    const buffer1 = component.networkPlugin.addListener;
    const buffer2 = component.networkPlugin.getStatus;
    const loadDataSpy = spyOn(component, 'loadData');
    component.networkPlugin.addListener = (a, b) => {
      testCalled = true;
      b({connected: false});
    };
    component.networkPlugin.getStatus = () => {
      testCalled = true;
      return {connected: false};
    };
    await component.ngOnInit();
    expect(testCalled).toEqual(true);
    expect(loadDataSpy).not.toHaveBeenCalled();
    component.networkPlugin.addListener = buffer1;
    component.networkPlugin.getStatus = buffer2;
  });

  it('events subscribe check: connected true', async () => {
    component.networkStatus = true;
    const loadDataSpy = spyOn(component, 'loadData');
    await component.events.publish('language:changed');

    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('events subscribe check: connected false', async () => {
    component.networkStatus = false;
    const loadDataSpy = spyOn(component, 'loadData');
    await component.events.publish('language:changed');

    expect(loadDataSpy).not.toHaveBeenCalled();
  });

  it('Network true: try again', async () => {
    const buffer = component.networkPlugin.getStatus;
    const loadDataSpy = spyOn(component, 'loadData'); 
    let testCalled = false;
    component.networkPlugin.getStatus = () => {
      testCalled = true;
      return {connected: true};
    };
    await component.tryAgain();
    expect(testCalled).toEqual(true);
    expect(loadDataSpy).toHaveBeenCalled();
    component.networkPlugin.getStatus = buffer;
  });

  it('Network false: try again', async () => {
    const buffer = component.networkPlugin.getStatus;
    const loadDataSpy = spyOn(component, 'loadData');
    let testCalled = false;
    component.networkPlugin.getStatus = () => {
      testCalled = true;
      return {connected: false};
    };
    await component.tryAgain();
    expect(testCalled).toEqual(true);
    expect(loadDataSpy).not.toHaveBeenCalled();
    component.networkPlugin.getStatus = buffer;
  });


});

class MockDataService {
  getBaseData() {
    return new Observable(observer => {
      observer.next( {'locations': {}} );
      observer.complete();
    });
  }
}