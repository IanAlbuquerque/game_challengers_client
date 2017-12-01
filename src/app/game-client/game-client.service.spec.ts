import { TestBed, inject } from '@angular/core/testing';

import { GameClientService } from './game-client.service';

describe('GameClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameClientService]
    });
  });

  it('should be created', inject([GameClientService], (service: GameClientService) => {
    expect(service).toBeTruthy();
  }));
});
