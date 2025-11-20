import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, switchMap, take, throwError } from 'rxjs';
import { ProjectService } from '../../../../../Services/project.service';
import { Project } from '../../../../../Entities/project';
import { ReceivableUtils } from '../../receivables/utils/receivable-utils';
import { OrderUtils } from '../../orders/utils/order-utils';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for projects-related business logic and operations.
 * Works with Project Service's reactive signals while providing additional functionality.
 */
export class ProjectUtils {
  private readonly projectService = inject(ProjectService);
  private readonly debtUtils = inject(ReceivableUtils);
  private readonly orderUtils = inject(OrderUtils);

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
    const checks = [
      this.debtUtils.getAllReceivableByProjectId(id).pipe(
        take(1),
        map(debts => ({
          valid: debts.length === 0,
          error: 'Cannot be deleted because have associated receivables'
        }))
      ),
      this.orderUtils.getAllOrdersByProjectId(id).pipe(
        take(1),
        map(orders => ({
          valid: orders.length === 0,
          error: 'Cannot be deleted because have associated orders'
        }))
      )
    ];
    return forkJoin(checks).pipe(
      switchMap(results => {
        const isThereAssociatedEntities = results.find(r => !r.valid);
        if (isThereAssociatedEntities) {
            return throwError(() => new Error(isThereAssociatedEntities.error));
        }

        return this.projectService.deleteProject(id)
      })
    )
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
          return throwError(() => new Error('Project not found'));
        }

        if (currentProject.version !== project.version) {
          return throwError(() => new Error('Conflict detected: project person version mismatch'));
        }

        return this.projectService.updateProject(project);
      })
    );
  }
}