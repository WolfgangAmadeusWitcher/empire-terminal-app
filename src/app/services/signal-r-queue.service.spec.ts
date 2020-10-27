import { TestBed } from '@angular/core/testing';

import { SignalRQueueService } from './signal-r-queue.service';

describe('SignalRQueueService', () => {
  let service: SignalRQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalRQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
