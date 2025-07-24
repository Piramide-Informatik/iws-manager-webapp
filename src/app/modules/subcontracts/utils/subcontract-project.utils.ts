import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { SubcontractProjectService } from '../../../Services/subcontract-project.service';
import { SubcontractProject } from '../../../Entities/subcontract-project';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for subcontracts-project business logic and operations.
 * Works with SubcontractProjectService's reactive signals while providing additional functionality.
 */
export class SubcontractProjectUtils {
  private readonly subcontractProjectService = inject(SubcontractProjectService);
  /**
  * Gets all subcontracts projects given an id without any transformation
  * @param subcontractId Subcontract it where we retrieve projects
  * @returns Observable emitting the raw list of subcontracts projects
  */
  getAllSubcontractsProject(subcontractId: number): Observable<SubcontractProject[]> {
    return this.subcontractProjectService.getAllSubcontractsProject(subcontractId).pipe(
      catchError(() => throwError(() => new Error('Failed to load subcontracts')))
    );
  }

  /**
  * Gets a subcontract project by ID with proper error handling
  * @param id - ID of the subcontract project to retrieve
  * @returns Observable emitting the subcontract project or undefined if not found
  */
  getSubcontractProjectById(id: number): Observable<SubcontractProject | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid subcontract project ID'));
    }

    return this.subcontractProjectService.getSubcontractProjectById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load subcontract project'));
      })
    );
  }

  /**
  * Creates a new subcontract project with validation
  * @param subcontractProject - Subcontract project object to create (without id)
  * @returns Observable that completes when subcontract project is created
  */
  createNewSubcontractProject(subcontractProject: Omit<SubcontractProject, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<SubcontractProject> {
    return this.subcontractProjectService.addSubcontractProject(subcontractProject);
  }

 
  /**
  * Deletes a subcontract project by ID and updates the internal subcontracts project signal.
  * @param id - ID of the subcontract project to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteSubcontractProject(id: number): Observable<void> {
    return this.subcontractProjectService.deleteSubcontractProject(id).pipe(
      catchError(error => {
        console.log('Error delete subcontract project', error)
        return throwError(() => error);
      })
    );
  }

  /**
  * Updates a subcontract project by ID and updates the internal subcontracts project signal.
  * @param subcontractProject - Subcontract project object with updated data
  * @returns Observable that completes when the update is done
  */
  updateSubcontractProject(subcontractProject: SubcontractProject): Observable<SubcontractProject> {
    if (!subcontractProject.id) {
      return throwError(() => new Error('Invalid subcontract project data'));
    }

    return this.subcontractProjectService.getSubcontractProjectById(subcontractProject.id).pipe(
      take(1),
      switchMap((currentSubcontractProject) => {
        if (!currentSubcontractProject) {
          return throwError(() => new Error('Subcontract project not found'));
        }

        if (currentSubcontractProject.version !== subcontractProject.version) {
          return throwError(() => new Error('Conflict detected: subcontract project person version mismatch'));
        }

        return this.subcontractProjectService.updateSubcontractProject(subcontractProject);
      })
    );
  }
}