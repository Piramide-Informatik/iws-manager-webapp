import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsCommissionsModalComponent } from './iws-commissions-modal.component';

describe('IwsCommissionsModalComponent', () => {
  let component: IwsCommissionsModalComponent;
  let fixture: ComponentFixture<IwsCommissionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsCommissionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsCommissionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
