import { TestBed } from '@angular/core/testing';

import { FilterServiceService } from './filter-service.service';

describe('FilterServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilterServiceService = TestBed.get(FilterServiceService);
    expect(service).toBeTruthy();
  });
});
