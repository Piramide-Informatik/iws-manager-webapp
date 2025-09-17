import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, of, switchMap, take, throwError } from "rxjs";
import { SystemModule } from "../../../../../Entities/systemModule";
import { SystemModuleService } from "../../../../../Services/system-module.service";

@Injectable({ providedIn: 'root' })
export class ModuleUtils {
    private readonly moduleService = inject(SystemModuleService);
        
    loadInitialData(): Observable<SystemModule[]> {
        return this.moduleService.loadInitialData();
    }

    getAllSystemModules(): Observable<SystemModule[]> {
            return this.moduleService.getAllSystemModules().pipe(
            catchError(() => throwError(() => new Error('Failed to load modules')))
            );
    }
}