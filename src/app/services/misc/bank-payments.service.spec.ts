import { TestBed } from '@angular/core/testing';

import { BankPaymentsService } from './bank-payments.service';

describe('BankPaymentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BankPaymentsService = TestBed.get(BankPaymentsService);
    expect(service).toBeTruthy();
  });
});
