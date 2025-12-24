import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectEmployeeService } from '../../../Services/project-employee.service';
import { ProjectEmployee } from '../../../Entities/projectEmployee';

/**
 * Utility class for project employee business logic and operations.
 * Works with ProjectEmployeeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ProjectEmployeeUtils {
  private readonly projectEmployeeService = inject(ProjectEmployeeService);

  /**
   * Gets all project period by project
   */
  getAllProjectPeriodByProject(projectId: number): Observable<ProjectEmployee[]> {
    return this.projectEmployeeService.getAllProjectsEmployeeByProject(projectId);
  }

}