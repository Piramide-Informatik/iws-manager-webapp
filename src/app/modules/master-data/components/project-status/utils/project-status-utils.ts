import {Injectable, inject} from '@angular/core';
import {Observable, catchError, map, take, throwError, switchMap, of} from 'rxjs';
import { ProjectStatus} from  '../../../../../Entities/projectStatus';
import { ProjectStatusService } from '../../../../../Services/project-status.service';

@Injectable({ providedIn: 'root' })
export class ProjectStatusUtils {
    private readonly projectStatusService = inject(ProjectStatusService);
    
    loadInitialData(): Observable<ProjectStatus[]> {
        return this.projectStatusService.loadInitialData();
    }

    addProjectStatus(nameProjectStatus: string): Observable<ProjectStatus>{
        const trimmedName = nameProjectStatus?.trim();
        if (!trimmedName) {
            return throwError(() => new Error('ProjectStatus name cannot be empty'));
        }

        return this.projectExists(trimmedName).pipe(
        switchMap(exists => {
            if (exists) {
            return throwError(() => new Error('PROJECT_STATUS.ERROR.ALREADY_EXISTS'));
            }

            return this.projectStatusService.addProjectStatus({ name: trimmedName });
        }),
        catchError(err => {
            if (err.message === 'PROJECT_STATUS.ERROR.ALREADY_EXISTS' || err.message === 'PROJECT_STATUS.ERROR.EMPTY') {
            return throwError(() => err);
            }

            console.error('Error creating title:', err);
            return throwError(() => new Error('PROJECT_STATUS.ERROR.CREATION_FAILED'));
        })
        );
    }

    //Get a projectStatus by ID
    getProjectStatusById(id: number): Observable< ProjectStatus | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid projectStatus ID'));
        }
        return this.projectStatusService.getProjectStatusById(id).pipe(
            catchError(err => {
                console.error('Error fetching projectStatus:', err);
                return throwError(() => new Error('Failed to load projectStatus'));
            })
        );
    }
    //Creates a new projectStatus with validation
    createNewProjectStatus(nameProjectStatus: string): Observable<void> {
        if (!nameProjectStatus?.trim()) {
            return throwError(() => new Error('ProjectStatus name cannot be empty'));
        }
        return new Observable<void>(subscriber => {
            this.projectStatusService.addProjectStatus({
                name: nameProjectStatus.trim()
            });
            subscriber.next();
            subscriber.complete();
        });
    }

    //Check if a projectStatus exists
    projectExists(name: string): Observable<boolean> {
        return this.projectStatusService.getAllProjectStatuses().pipe(
            map(projectStatuses => projectStatuses.some(
                t => t.name.toLowerCase() === name.toLowerCase()
            )),
            catchError(err => {
                console.error('Error checking projectStatus existence:', err);
                return throwError(() => new Error('Failed to check projectStatus existence'));
            })
        );
    }

    //Gets all projectStatuses sorted alphabetically by name
    getProjectStatusesSortedByName() : Observable<ProjectStatus[]> {
        return this.projectStatusService.getAllProjectStatuses().pipe(
            map(projectStatuses => [...projectStatuses].sort((a, b) => a.name.localeCompare(b.name))),
            catchError(err => {
                console.error('Error sorting projectStatus:', err);
                return throwError(() => new Error('Failed to sort projectStatus'));
            })
        );
    }

    //Refreshes projectStatuses data
    refreshProjectStatuses(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.projectStatusService.refreshProjectStatuses();
            subscriber.next();
            subscriber.complete();
        });
    }

    //Deletes a projectStatus by ID
    deleteProjectStatus(id: number): Observable<void> {
        return this.checkProjectStatusUsage(id).pipe(
            switchMap(isUsed => {
                if (isUsed) {
                    return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
                }
                return this.projectStatusService.deleteProjectStatus(id);
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }
    //Checks if a projectStatus is used by any entity
    private checkProjectStatusUsage(idProjectStatus: number): Observable<boolean> {
        // For now, no use has been verified in any entity.
        return of(false);
    }

    //Update a projectStatus by ID and updates the internal projectStatus signal
    updateProjectStatus(projectStatus: ProjectStatus): Observable<ProjectStatus> {
        if (!projectStatus?.id) {
            return throwError(() => new Error('Invalid projectStatus data'));
        }
        return this.projectStatusService.getProjectStatusById(projectStatus.id).pipe(
            take(1),
            map((currentProjectStatus) => {
                if (!currentProjectStatus) {
                    throw new Error('ProjectStatus not found');
                }
                if (currentProjectStatus.version !== projectStatus.version) {
                    throw new Error('Version conflict: ProjectStatus has been updated by another user');
                }
                return projectStatus;
            }),
            switchMap((validatedProjectStatus: ProjectStatus) => this.projectStatusService.updateProjectStatus(validatedProjectStatus)),
            catchError((err) => {
                console.error('Error updating projectStatus:', err);
                return throwError(() => err);
            })
        );
    }
}