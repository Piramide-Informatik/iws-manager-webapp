import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TeamIws } from '../../../../../Entities/teamIWS';

@Injectable({ providedIn: 'root' })
export class TeamIwsStateService {
    private readonly editTeamIwsSource = new BehaviorSubject<TeamIws | null>(null);
    currentTeamIws$ = this.editTeamIwsSource.asObservable();

    setTeamIwsToEdit(team: TeamIws | null): void {
        this.editTeamIwsSource.next(team);
    }

    clearTitle() {
        this.editTeamIwsSource.next(null);
    }
}