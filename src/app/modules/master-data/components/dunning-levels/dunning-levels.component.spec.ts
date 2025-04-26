import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DunningLevelsComponent } from './dunning-levels.component';

describe('DunningLevelsComponent', () => {
  let component: DunningLevelsComponent;
  let fixture: ComponentFixture<DunningLevelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DunningLevelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DunningLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
