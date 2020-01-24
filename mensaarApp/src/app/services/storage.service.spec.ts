import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created and initialize favorite meals', () => {
    const service: StorageService = TestBed.get(StorageService);
    expect(service).toBeTruthy();
    expect(service.getFavoriteMeals()).toBeDefined();
  });



  it('after setting, getting should be possible', async function () {

    const service: StorageService = await TestBed.get(StorageService);
    expect(service).toBeTruthy();

    const key1 = "test";
    const value1 = ["val1", "val2"];
    await service.setStorage(key1, JSON.stringify(value1));
    let valueToKey = await service.getStorage(key1);
    valueToKey = JSON.parse(valueToKey);
    // console.log(valueToKey);
    expect(valueToKey).toEqual(value1);
  });

  //add something to storage, get, check if its there, 
  //remove, check if its gone
  it('removing from storage works', async function () {
    const service: StorageService = TestBed.get(StorageService);
    expect(service).toBeTruthy();

    const key1 = "test";
    const value1 = "val1";
    await service.setStorage(key1, value1);
    const valueToKey = await service.getStorage(key1);
    expect(valueToKey).toEqual(String(value1));

    await service.removeStorage(key1);
    const stor2 = await service.getStorage(key1);
    expect(stor2).not.toContain(value1)
  });


  //add meals to storage, get, check if there there, 
  //remove one, check if its gone and the other one is there
  it('set favorite meals, and remove one meal again', async function () {
    const service: StorageService = await TestBed.get(StorageService);
    expect(service).toBeTruthy();
    await expect(service.getFavoriteMeals()).toBeDefined();

    let meal1 = "Spaghetti";
    let meal2 = "Pasta";
    let mensa1 = "sb";

    await service.setFavoriteMeals(mensa1, meal1);
    await service.setFavoriteMeals(mensa1, meal2);
    await expect(service.getFavoriteMeals()).toBeDefined();
    let favs = await service.getFavoriteMeals()
    await expect(favs[mensa1]).toContain(meal1);
    await expect(favs[mensa1]).toContain(meal2);


    await service.removeSingleMeal(mensa1, meal1);
    let favs2 = await service.getFavoriteMeals()
    await expect(favs2[mensa1]).not.toContain(meal1);
    await expect(favs2[mensa1]).toContain(meal2);


  });
  //add to storage, get, check if its there, 
  //remove entire favorite meals object, check if object is gone
  it('set favorite meal, remove all favorite meals', async function () {
    const service: StorageService = TestBed.get(StorageService);
    await expect(service).toBeTruthy();
    await expect(service.getFavoriteMeals()).toBeDefined();

    let meal1 = "Spaghetti";
    let mensa1 = "sb";

    await service.setFavoriteMeals(mensa1, meal1);
    await expect(service.getFavoriteMeals()).toBeDefined();
    let favs = await service.getFavoriteMeals();
    await expect(favs[mensa1]).toContain(meal1);

    await service.removeFavoriteMeals();
    const val = await service.getFavoriteMeals();
    await expect(val).toBeNull();
  });

});
