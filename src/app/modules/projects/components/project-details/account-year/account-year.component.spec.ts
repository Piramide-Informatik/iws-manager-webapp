import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsAccountYearOverviewComponent } from './account-year.component';

describe('ProjectsAccountYearOverviewComponent', () => {
  let component: ProjectsAccountYearOverviewComponent;
  let fixture: ComponentFixture<ProjectsAccountYearOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectsAccountYearOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsAccountYearOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
