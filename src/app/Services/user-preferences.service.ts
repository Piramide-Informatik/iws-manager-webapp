import { Injectable } from '@angular/core';
import { UserPreference, UserPreferenceItem } from '../Entities/user-preference';

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

  setLanguage(language: any) {
    const userPreferenceData = localStorage.getItem('userPreferences');
    const userPreferences: UserPreference = userPreferenceData ? JSON.parse(userPreferenceData) : {};
    userPreferences['language'] = language;
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    return userPreferences;
  }

  getLanguage() {
    const userPreferenceData = localStorage.getItem('userPreferences');
    const userPreferences: UserPreference = userPreferenceData ? JSON.parse(userPreferenceData) : {};
    return userPreferences['language']
  }

}