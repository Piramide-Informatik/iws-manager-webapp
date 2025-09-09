import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsTeamsModalComponent } from './iws-teams-modal.component';

describe('IwsTeamsModalComponent', () => {
  let component: IwsTeamsModalComponent;
  let fixture: ComponentFixture<IwsTeamsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsTeamsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsTeamsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
