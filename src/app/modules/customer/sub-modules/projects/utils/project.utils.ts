import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { ProjectService } from '../../../../../Services/project.service';
import { Project } from '../../../../../Entities/project';
import { ReceivableUtils } from '../../receivables/utils/receivable-utils';
import { OrderUtils } from '../../orders/utils/order-utils';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for projects-related business logic and operations.
 * Works with Project Service's reactive signals while providing additional functionality.
 */
export class ProjectUtils {
  private readonly projectService = inject(ProjectService);
  private readonly debtUtils = inject(ReceivableUtils);
  private readonly orderUtils = inject(OrderUtils);

  loadInitialData(): Observable<Project[]> {
    return this.projectService.loadInitialData();
  }

  /**
  * Gets all projects without any transformation
  * @returns Observable emitting the raw list of projects
  */
  getAllProjects(): Observable<Project[]> {
    return this.projectService.getAllProjects().pipe(
      catchError(() => throwError(() => new Error('Failed to load projects')))
    );
  }

  /**
  * Gets a project by ID with proper error handling
  * @param id - ID of the project to retrieve
  * @returns Observable emitting the project or undefined if not found
  */
  getProjectById(id: number): Observable<Project | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid project ID'));
    }

    return this.projectService.getProjectById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load project'));
      })
    );
  }

  /**
  * Gets all projects given a customer
  * @param customerId - Customer to get his projects
  * @returns Observable emitting the raw list of projects
  */
  getAllProjectByCustomerId(customerId: number): Observable<Project[]> {
    return this.projectService.getAllProjectsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load projects')))
    );
  }

  /**
  * Creates a new project with validation
  * @param project - Project object to create (without id)
  * @returns Observable that completes when project is created
  */
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Project> {
    return this.projectService.addProject(project);
  }

  /**
  * Deletes a project by ID and updates the internal projects signal.
  * @param id - ID of the project to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteProject(id: number): Observable<void> {
    return this.projectService.deleteProject(id)
  }

  /**
  * Updates a project by ID and updates the internal projects signal.
  * @param project - Project object with updated data
  * @returns Observable that completes when the update is done
  */
  updateProject(project: Project): Observable<Project> {
    if (!project.id) {
      return throwError(() => new Error('Invalid project data'));
    }

    return this.projectService.getProjectById(project.id).pipe(
      take(1),
      switchMap((currentProject) => {
        if (!currentProject) {
          return throwError(() => createNotFoundUpdateError('Project'));
        }

        if (currentProject.version !== project.version) {
          return throwError(() => createUpdateConflictError('Project'));
        }

        return this.projectService.updateProject(project);
      })
    );
  }
}