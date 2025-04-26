import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIwsCommissionsComponent } from './edit-iws-commissions.component';

describe('EditIwsCommissionsComponent', () => {
  let component: EditIwsCommissionsComponent;
  let fixture: ComponentFixture<EditIwsCommissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditIwsCommissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIwsCommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
