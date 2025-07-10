import { TestBed } from '@angular/core/testing';

import { ExportServices } from './export-services';

describe('ExportServices', () => {
  let service: ExportServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
