import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterdataPanelComponent } from './masterdata-panel.component';

describe('MasterdataPanelComponent', () => {
  let component: MasterdataPanelComponent;
  let fixture: ComponentFixture<MasterdataPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterdataPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterdataPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
