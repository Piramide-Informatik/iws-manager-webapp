import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectPackageService } from '../../../Services/project-package.service';
import { ProjectPackage } from '../../../Entities/ProjectPackage';

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
}