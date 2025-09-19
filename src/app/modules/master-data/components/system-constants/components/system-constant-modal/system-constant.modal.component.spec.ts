import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemConstantModalComponent } from './system-constant.modal.component';


describe('SystemConstantModalComponent', () => {
  let component: SystemConstantModalComponent;
  let fixture: ComponentFixture<SystemConstantModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemConstantModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConstantModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
