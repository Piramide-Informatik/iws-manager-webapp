import { Injectable } from '@angular/core';
import { Title } from '../Entities/title';
import { UserPreference, UserPreferenceItem } from '../Entities/user-preference';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {

  getUserPreferences(tableKey: string, columns: any[]): UserPreference {
    const userPreferenceData = localStorage.getItem('userPreferences');
    const userPreferences: UserPreference = userPreferenceData ? JSON.parse(userPreferenceData) : {};
    if (!userPreferences[tableKey]) {
       const userPreference: UserPreferenceItem = {
          displayedColumns: columns,
          filter: {}
       }
       userPreferences[tableKey] = userPreference;
    } else {
        userPreferences[tableKey].displayedColumns = 
          userPreferences[tableKey].displayedColumns
          .map((col: any) => columns.find((selectedColumn: any) => selectedColumn.field == col.field));
    }
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    return userPreferences;
  }
}