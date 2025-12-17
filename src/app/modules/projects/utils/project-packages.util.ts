import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, take, throwError } from 'rxjs';
import { ProjectPackageService } from '../../../Services/project-package.service';
import { ProjectPackage } from '../../../Entities/ProjectPackage';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';

/**
 * Utility class for project packages business logic and operations.
 * Works with ProjectPackagesService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ProjectPackagesUtils {
  private readonly projectPackagesService = inject(ProjectPackageService);

  /**
   * Gets all project packages by project
   */
  getAllProjectPackageByProject(projectId: string): Observable<ProjectPackage[]> {
    return this.projectPackagesService.getAllProjectsPackagesByProject(projectId);
  }

  /**
   * Creates a new project package with validation
   */
  addProjectPage(projectPackage: Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectPackage> {
    return this.projectPackagesService.addProjectPackage(projectPackage);
  }

  /**
  * Updates a project Package.
  * @param projectPackage - Project Package object with updated data
  * @returns Observable that completes when the update is done
  */
  updateProjectPackage(projectPackage: ProjectPackage): Observable<ProjectPackage> {
    if (!projectPackage.id) {
      return throwError(() => new Error('Invalid project package data'));
    }

    return this.projectPackagesService.getProjectPackageById(projectPackage.id).pipe(
      take(1),
      switchMap((currentProjectPackage) => {
        if (!currentProjectPackage) {
          return throwError(() => createNotFoundUpdateError('Project Package'));
        }

        if (currentProjectPackage.version !== projectPackage.version) {
          return throwError(() => createUpdateConflictError('Project Package'));
        }

        return this.projectPackagesService.updateProjectPackage(projectPackage);
      })
    );
  }
}