import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcontractsDetailsComponent } from './subcontracts-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG modules usados en el HTML
import { ButtonModule } from 'primeng/button';

describe('SubcontractsDetailsComponent', () => {
  let component: SubcontractsDetailsComponent;
  let fixture: ComponentFixture<SubcontractsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubcontractsDetailsComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        // Si usas subcomponentes NO standalone en HTML, también deben declararse o mockearse
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubcontractsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
