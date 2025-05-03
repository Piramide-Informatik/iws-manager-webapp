import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIwsTeamComponent } from './edit-iws-team.component';

describe('EditIwsTeamComponent', () => {
  let component: EditIwsTeamComponent;
  let fixture: ComponentFixture<EditIwsTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditIwsTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIwsTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
