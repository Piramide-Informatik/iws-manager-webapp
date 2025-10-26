import { Injectable, inject } from '@angular/core';
import {
    Observable,
    catchError,
    take,
    throwError,
    switchMap,
    map,
} from 'rxjs';
import { TeamIws } from '../../../../../Entities/teamIWS';
import { TeamIwsService } from '../../../../../Services/team-iws.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
export class TeamIwsUtils {
    private readonly teamIwsService = inject(TeamIwsService);

    loadInitialData(): Observable<TeamIws[]> {
        return this.teamIwsService.loadInitialData();
    }

    addTeamIws(
        teamIWS: Omit<TeamIws, 'id' | 'createdAt' | 'updatedAt' | 'version'>
    ): Observable<TeamIws> {
        // Validar que name no sea undefined o vacío
        const teamName = teamIWS.name?.trim() || '';
        if (!teamName) {
            return throwError(() => new Error('Team name is required'));
        }

        return this.teamNameExists(teamName).pipe(
            switchMap((exists) => {
                if (exists) {
                    return throwError(() => new Error('team name already exists'));
                }
                return this.teamIwsService.addTeamIws(teamIWS);
            }),
            catchError((err) => {
                if (err.message === 'team name already exists') {
                    return throwError(() => err);
                }
                return throwError(() => new Error('IWS_TEAMS.ERROR.CREATION_FAILED'));
            })
        );
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

    deleteTeamIws(id: number): Observable<void> {
        return this.teamIwsService.deleteTeamIws(id);
    }

    updateTeamIws(teamIws: TeamIws): Observable<TeamIws> {
        if (!teamIws?.id) {
            return throwError(() => new Error('Invalid teamIws data'));
        }

        // Validar que name no sea undefined o vacío
        const teamName = teamIws.name?.trim() || '';
        if (!teamName) {
            return throwError(() => new Error('Team name is required'));
        }

        return this.teamIwsService.getTeamIwsById(teamIws.id).pipe(
            take(1),
            switchMap((currentTeamIws) => {
                if (!currentTeamIws) {
                    return throwError(() => createNotFoundUpdateError('IWS Team'));
                }
                if (currentTeamIws.version !== teamIws.version) {
                    return throwError(() => createUpdateConflictError('IWS Team'));
                }
                
                // Check if team name already exists (excluding current team)
                return this.teamNameExists(teamName, teamIws.id).pipe(
                    switchMap((exists) => {
                        if (exists) {
                            return throwError(() => new Error('team name already exists'));
                        }
                        return this.teamIwsService.updateTeamIws(teamIws);
                    })
                );
            }),
            catchError((err) => {
                console.error('Error updating TeamIws:', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Checks if a team name already exists (case-insensitive comparison)
     * @param teamName - Team name to check
     * @param excludeId - ID to exclude from check (for updates)
     * @returns Observable emitting boolean indicating existence
     */
    private teamNameExists(teamName: string, excludeId?: number): Observable<boolean> {
        return this.teamIwsService.getAllTeamsIws().pipe(
            map(teams => teams.some(
                team => team.id !== excludeId && 
                       team.name?.toLowerCase() === teamName.toLowerCase()
            )),
            catchError(() => {
                return throwError(() => new Error('Failed to check team name existence'));
            })
        );
    }
}