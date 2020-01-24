import { TestBed } from '@angular/core/testing';
import { MensaService } from './mensa.service';
import { StorageService } from './storage.service';


describe('MensaService', () => {
  let storageService: StorageService;
  let service: MensaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService
      ]
    })
    storageService = TestBed.get(StorageService)
  });

  beforeEach(() => {
    service = TestBed.get(MensaService);
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initial no favourit mensa', async () => {
    storageService.removeStorage('SELECTED_MENSA');
    await service.setInitialAppMensa()
    expect(storageService.getStorage("SELECTED_MENSA").then(data =>
      expect(data).toEqual("none")
    )).toBeTruthy()
  })

  it('set a mensa a get correct mensa text', () => {
    expect(service.getMensaName("sb")).toEqual("Mensa/Mensacafe Saar")
  });

  it('get none if mensa not exist', async () => {
    expect(service.getMensaName("dummy")).toEqual("none")
  });

  it('selected mensa is set (setMensa)', () => {
    service.setMensa("dummy");

    expect(storageService.getStorage("SELECTED_MENSA").then(data =>
      expect(data).toEqual("dummy")
    )).toBeTruthy()

    service.setMensa("none");
  });


});
