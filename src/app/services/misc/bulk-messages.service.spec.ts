import { TestBed } from '@angular/core/testing';

import { BulkMessagesService } from './bulk-messages.service';

describe('BulkMessagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BulkMessagesService = TestBed.get(BulkMessagesService);
    expect(service).toBeTruthy();
  });
});
