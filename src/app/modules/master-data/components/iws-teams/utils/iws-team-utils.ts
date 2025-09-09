import { Injectable, inject } from '@angular/core';
import {
    Observable,
    catchError,
    map,
    take,
    throwError,
    switchMap,
    of,
} from 'rxjs';
import { TeamIws } from '../../../../../Entities/teamIWS';
import { TeamIwsService } from '../../../../../Services/team-iws.service';

@Injectable({ providedIn: 'root' })
export class TeamIwsUtils {
    private readonly teamIwsService = inject(TeamIwsService);

    loadInitialData(): Observable<TeamIws[]> {
        return this.teamIwsService.loadInitialData();
    }

    addTeamIws(
        teamIWS: Omit<TeamIws, 'id' | 'createdAt' | 'updatedAt' | 'version'>
    ): Observable<TeamIws> {
        return this.teamIwsService.addTeamIws(teamIWS);
    }

    getAllTeamIws(): Observable<TeamIws[]> {
        return this.teamIwsService.getAllTeamsIws();
    }

    getTeamIwsById(id: number): Observable<TeamIws | undefined> {
        if (!id || id <= 0) {
        return throwError(() => new Error('Invalid TeamIws ID'));
        }

        return this.teamIwsService.getTeamIwsById(id).pipe(
        catchError((err) => {
            console.error('Error fetching TeamIws:', err);
            return throwError(() => new Error('Failed to load TeamIws'));
        })
        );
    }
    refreshTeamIws(): Observable<void> {
        return new Observable<void>((subscriber) => {
        this.teamIwsService.loadInitialData();
        subscriber.next();
        subscriber.complete();
        });
    }
    //Delete a TeamIws by ID after checking if it's used by any entity
    deleteTeamIws(id: number): Observable<void> {
        return this.checkTeamIwsUsage(id).pipe(
        switchMap((isUsed) => {
            if (isUsed) {
            return throwError(
                () =>
                new Error(
                    'Cannot delete register: it is in use by other entities'
                )
            );
            }
            return this.teamIwsService.deleteTeamIws(id);
        }),
        catchError((error) => {
            return throwError(() => error);
        })
        );
    }
    //Checks if a TeamIws is used by any entity
    private checkTeamIwsUsage(idIwsCommission: number): Observable<boolean> {
        return of(false);
    }
    //Update a TeamIws by ID and updates the internal TeamIws signal
    updateTeamIws(teamIws: TeamIws): Observable<TeamIws> {
        if (!teamIws?.id) {
        return throwError(() => new Error('Invalid teamIws data'));
        }

        return this.teamIwsService.getTeamIwsById(teamIws.id).pipe(
        take(1),
        map((currentTeamIws) => {
            if (!currentTeamIws) {
            throw new Error('teamIws not found');
            }
            if (currentTeamIws.version !== teamIws.version) {
            throw new Error(
                'Version conflict: TeamIws has been updated by another user'
            );
            }
            return teamIws;
        }),
        switchMap((validatedTeamIws: TeamIws) =>
            this.teamIwsService.updateTeamIws(validatedTeamIws)
        ),
        catchError((err) => {
            console.error('Error updating TeamIws:', err);
            return throwError(() => err);
        })
        );
    }
}
