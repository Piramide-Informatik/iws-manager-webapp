import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsTeamsTableComponent } from './iws-teams-table.component';

describe('IwsTeamsTableComponent', () => {
  let component: IwsTeamsTableComponent;
  let fixture: ComponentFixture<IwsTeamsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsTeamsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsTeamsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
