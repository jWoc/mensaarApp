import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteFoodPage } from './favorite-food.page';
import { TranslateModule, TranslateService} from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage.service';

describe('FavoriteFoodPage', () => {
  let component: FavoriteFoodPage;
  let fixture: ComponentFixture<FavoriteFoodPage>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteFoodPage ],
      imports: [TranslateModule.forRoot()],
      providers: [TranslateService, {provide: StorageService, useClass: MockStorageService}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteFoodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('unfavoriteFood', async () => { 
    await component.unfavoriteFood('hom', 'Schnitzel');
    expect(component.favoriteFoods).not.toContain('hom', 'Schnitzel');
  });
});

class MockStorageService {
  async removeSingleMeal(mensaName: string, foodname: string) { }
  async getFavoriteMeals() {return {'testMensa': 'testMeal', 'hom': 'Schnitzel'}; }
}
