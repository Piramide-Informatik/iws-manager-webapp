import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectPeriodService } from '../../../Services/project-period.service';
import { ProjectPeriod } from '../../../Entities/project-period';

/**
 * Utility class for project period business logic and operations.
 * Works with ProjectPeriodService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ProjectPeriodUtils {
  private readonly projectPeriodService = inject(ProjectPeriodService);

  /**
   * Gets all project period by project
   */
  getAllProjectPeriodByProject(projectId: string): Observable<ProjectPeriod[]> {
    return this.projectPeriodService.getAllProjectsPeriodsByProject(projectId);
  }

  /**
   * Delete Project Period
   */
  deleteProjectPeriod(projectPeriodId: number): Observable<void> {
    return this.projectPeriodService.deleteProjectPeriod(projectPeriodId);
  }
}