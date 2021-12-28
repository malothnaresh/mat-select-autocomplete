import { TestBed } from '@angular/core/testing';

import { MultiselectService } from './select-autocomplete.service';

describe('MultiselectService', () => {
  let service: MultiselectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiselectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
