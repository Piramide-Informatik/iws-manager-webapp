import { Injectable } from '@angular/core';
import { WorkContract } from '../../../Entities/work-contracts';

@Injectable({
  providedIn: 'root',
})
export class WorkContractsDataService {
  constructor() { }

  list(): WorkContract[] {
    return [];
  }
}

