import { TestBed } from '@angular/core/testing';

import { PinballService } from './pinball.service';

describe('PinballService', () => {
  let service: PinballService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinballService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
