import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectStatus } from '../../../../../Entities/projectStatus';

@Injectable({ providedIn: 'root' })
export class ProjectStatusStateService {
    private readonly editProjectStatusSource = new BehaviorSubject<ProjectStatus | null>(null);
    currentProjectStatus$ = this.editProjectStatusSource.asObservable();

    setProjectStatusToEdit(projectStatus: ProjectStatus | null): void {
        this.editProjectStatusSource.next(projectStatus)
    }

    clearProjectStatus(): void {
        this.editProjectStatusSource.next(null);
    }
}