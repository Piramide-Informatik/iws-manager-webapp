import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, of, tap } from "rxjs";
import { SystemFunction } from "../../../../../Entities/systemFunction";
import { SystemFunctionWithRights } from "../../../../../Entities/systemFunctionWithRights";
import { SystemFunctionService } from "../../../../../Services/systen-function.service";

@Injectable({ providedIn: 'root' })
export class FunctionUtils {
    private readonly functionService = inject(SystemFunctionService);
            
    loadInitialData(): Observable<SystemFunction[]> {
        return this.functionService.loadInitialData();
    }

    private readonly _error: { set: (value: string | null) => void } = {
    set: (value: string | null) => {
        if (value) {
        console.error("FunctionUtils Error:", value);
        }
    },
    };


     // READ ALL
    getAllSystemFunction(): Observable<SystemFunctionWithRights[]> {
        return this.functionService.getAllSystemFunction().pipe(
        map((functions: SystemFunction[]) =>
            functions.map(fn => ({
            ...fn,
            read: false,
            insert: false,
            modify: false,
            delete: false,
            execute: false,
            }))
        ),
        tap(() => this._error.set(null)),
        catchError(err => {
            this._error.set("Failed to fetch system functions");
            console.error("Error fetching system functions:", err);
            return of([]);
        })
    );
    }

    // GET BY MODULE ID
    getFunctionsByModuleId(id: number): Observable<SystemFunctionWithRights[] > {
        console.log("id function:"+id)
            return this.functionService.getFunctionsByModuleId(id).pipe(
        map((functions: SystemFunction[]) =>
            functions.map(fn => ({
            ...fn,
            read: false,
            insert: false,
            modify: false,
            delete: false,
            execute: false,
            }))
        ),
        tap(() => this._error.set(null)),
        catchError(err => {
            this._error.set("Failed to fetch functions by module ID");
            console.error("Error fetching functions by module ID:", err);
            return of([]);
        })
        );
    }
}