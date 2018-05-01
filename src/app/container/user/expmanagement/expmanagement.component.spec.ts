import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpmanagementComponent } from './expmanagement.component';

describe('ExpmanagementComponent', () => {
  let component: ExpmanagementComponent;
  let fixture: ComponentFixture<ExpmanagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpmanagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
