import { Component } from '@angular/core';
import { ProjectPackage } from '../../../../../Entities/ProjectPackage';
import { UserPreference } from '../../../../../Entities/user-preference';

@Component({
  selector: 'app-work-packages',
  standalone: false,
  templateUrl: './work-packages.component.html',
  styleUrl: './work-packages.component.scss',
})
export class WorkPackagesComponent {
  tableKey: string = 'Allocations';
  projectpackageList!: ProjectPackage[];
  projectpackageColumns: any[] = [];
  userPreferences: UserPreference = {};
  dataKeys = ['packageNo', 'serial', 'packageTitle', 'startDate', 'endDate'];

  onWorkPackagesUserPreferencesChanges(userAllocationsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAllocationsPreferences));
  }

  handleProjectpackageTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {}
}
