import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowsercheckComponent } from './browsercheck.component';

describe('BrowsercheckComponent', () => {
  let component: BrowsercheckComponent;
  let fixture: ComponentFixture<BrowsercheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowsercheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowsercheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
