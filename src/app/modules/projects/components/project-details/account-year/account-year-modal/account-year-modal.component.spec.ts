import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsAccountYearModalComponent } from './account-year-modal.component';

describe('ProjectsAccountYearOverviewComponent', () => {
  let component: ProjectsAccountYearModalComponent;
  let fixture: ComponentFixture<ProjectsAccountYearModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectsAccountYearModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsAccountYearModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
