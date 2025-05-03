import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsTeamsComponent } from './iws-teams.component';

describe('IwsTeamsComponent', () => {
  let component: IwsTeamsComponent;
  let fixture: ComponentFixture<IwsTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
