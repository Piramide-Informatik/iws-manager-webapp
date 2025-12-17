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

  /**
   * Creates a new project package with validation
   */
  addProjectPage(projectPackage: Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectPackage> {
    return this.projectPackagesService.addProjectPackage(projectPackage);
  }

  /**
   * Delete a project package
   */
  deleteProjectPackage(id: number): Observable<void> {
    return this.projectPackagesService.deleteProjectPackage(id);
  }
}