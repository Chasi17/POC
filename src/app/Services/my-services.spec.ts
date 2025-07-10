import { TestBed } from '@angular/core/testing';

import { MyServices } from './my-services';

describe('MyServices', () => {
  let service: MyServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
