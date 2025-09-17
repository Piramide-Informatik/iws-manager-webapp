import { SystemFunction } from "./systemFunction";

export interface SystemFunctionWithRights extends SystemFunction {
    read: boolean;
    insert: boolean;
    modify: boolean;
    delete: boolean;
    execute: boolean;
}
