import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsCommissionsComponent } from './iws-commissions.component';

describe('IwsCommissionsComponent', () => {
  let component: IwsCommissionsComponent;
  let fixture: ComponentFixture<IwsCommissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsCommissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsCommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
