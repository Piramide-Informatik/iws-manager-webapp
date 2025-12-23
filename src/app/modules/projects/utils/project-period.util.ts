import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, take, throwError } from 'rxjs';
import { ProjectPeriodService } from '../../../Services/project-period.service';
import { ProjectPeriod } from '../../../Entities/project-period';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';

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
  getAllProjectPeriodByProject(projectId: number): Observable<ProjectPeriod[]> {
    return this.projectPeriodService.getAllProjectsPeriodsByProject(projectId);
  }

  /**
  * Creates a new project period with validation
  * @param projectPeriod - Project period object to create (without id)
  * @returns Observable that completes when project period is created
  */
  createProjectPeriod(projectPeriod: Omit<ProjectPeriod, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectPeriod> {
    return this.projectPeriodService.addProjectPeriod(projectPeriod);
  }

  /**
  * Deletes a project period by ID and updates the internal projects signal.
  * @param id - ID of the project period to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteProjectPeriod(id: number): Observable<void> {
    return this.projectPeriodService.deleteProjectPeriod(id);
  }

  /**
  * Updates a project period by ID and updates the internal projects period signal.
  * @param projectPeriod - Project period object with updated data
  * @returns Observable that completes when the update is done
  */
  updateProjectPeriod(projectPeriod: ProjectPeriod): Observable<ProjectPeriod> {
    if (!projectPeriod.id) {
      return throwError(() => new Error('Invalid project period data'));
    }

    return this.projectPeriodService.getProjectPeriodById(projectPeriod.id).pipe(
      take(1),
      switchMap((currentProjectPeriod) => {
        if (!currentProjectPeriod) {
          return throwError(() => createNotFoundUpdateError('Project Period'));
        }

        if (currentProjectPeriod.version !== projectPeriod.version) {
          return throwError(() => createUpdateConflictError('Project Period'));
        }

        return this.projectPeriodService.updateProjectPeriod(projectPeriod);
      })
    );
  }
}