import { Injectable } from '@angular/core';
import { Project } from '../../../Entities/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectDatastoreService {
  constructor() { }

  list(): Project[] {
    return [
      { projectLabel: 'FL', projectName: 'Falcon', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '15.04.2021', endDate: '21.12.2027', authDate: '08.05.2021', fundingRate: '0,01' },
      { projectLabel: 'AF', projectName: 'AllSafe', fundingProgram: 'OceanX', promoter: 'AWP', fundingLabel: 'OX', startDate: '07.08.2021', endDate: '10.01.2028', authDate: '20.08.2021', fundingRate: '0,02' },
      { projectLabel: 'GS', projectName: 'GoodSolutions', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '11.09.2021', endDate: '18.02.2028', authDate: '08.05.2021', fundingRate: '0,01' },
      { projectLabel: 'BH', projectName: 'BlueHorizon', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '02.10.2021', endDate: '21.12.2027', authDate: '08.05.2021', fundingRate: '0,03' },
      { projectLabel: 'FY', projectName: 'Freeyond', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '05.11.2021', endDate: '10.06.2028', authDate: '07.11.2021', fundingRate: '0,05' },
      { projectLabel: 'LW', projectName: 'LakeView', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '12.12.2021', endDate: '05.08.2028', authDate: '16.12.2021', fundingRate: '0,02' },
      { projectLabel: 'HZ', projectName: 'Horizon', fundingProgram: 'Northside', promoter: 'IWS', fundingLabel: 'NS', startDate: '18.12.2021', endDate: '01.10.2028', authDate: '28.12.2021', fundingRate: '0,03' }
    ];
  }
}
