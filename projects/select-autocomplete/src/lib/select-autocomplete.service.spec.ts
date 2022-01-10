import { TestBed } from '@angular/core/testing';

import { SelectAutocompleteService } from './select-autocomplete.service';

describe('SelectAutocompleteService', () => {
  let service: SelectAutocompleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectAutocompleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
