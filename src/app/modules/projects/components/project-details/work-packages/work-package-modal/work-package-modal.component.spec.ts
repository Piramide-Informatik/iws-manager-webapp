import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWorkPackageComponent } from './work-package-modal.component';

describe('ModalWorkPackageComponent', () => {
  let component: ModalWorkPackageComponent;
  let fixture: ComponentFixture<ModalWorkPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalWorkPackageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalWorkPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
