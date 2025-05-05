import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFunnelsComponent } from './project-funnels.component';

describe('ProjectFunnelsComponent', () => {
  let component: ProjectFunnelsComponent;
  let fixture: ComponentFixture<ProjectFunnelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectFunnelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFunnelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
