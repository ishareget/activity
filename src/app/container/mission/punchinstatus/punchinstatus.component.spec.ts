import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchinstatusComponent } from './punchinstatus.component';

describe('PunchinstatusComponent', () => {
  let component: PunchinstatusComponent;
  let fixture: ComponentFixture<PunchinstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PunchinstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PunchinstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
