import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchinComponent } from './punchin.component';

describe('PunchinComponent', () => {
  let component: PunchinComponent;
  let fixture: ComponentFixture<PunchinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PunchinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PunchinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
