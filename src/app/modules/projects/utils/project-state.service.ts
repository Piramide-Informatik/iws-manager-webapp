import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../../../Entities/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectStateService {
  private readonly editProjectSource = new BehaviorSubject<Project | null>(null);
  public currentProject$ = this.editProjectSource.asObservable();
  
  setProjectToEdit(project: Project | null): void {
    this.editProjectSource.next(project);
  }

  clearProject() {
    this.editProjectSource.next(null);
  }
}