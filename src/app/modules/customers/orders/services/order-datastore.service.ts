import { Injectable } from '@angular/core';
import { Order } from '../../../../Entities/order';

@Injectable({
  providedIn: 'root'
})
export class OrderDatastoreService {
  constructor() { }

  list(): Order[] {
    return [
      { orderNr: 2, orderLabel: 'MD', orderType: 'Medium', orderDate: '20.02.2025', acronym: 'OMD', fundingProgram: 'SadTech', value: '25941', contractStatus: 'Accepted', contractNr: '125-730-374', contractTitle: 'ACM', iwsPercent: '0.40', iwsPercentValue: '3481' },
      { orderNr: 3, orderLabel: 'BG', orderType: 'Big', orderDate: '06.03.2025', acronym: 'OBG', fundingProgram: 'LakeView', value: '48230', contractStatus: 'Accepted', contractNr: '127-730-374', contractTitle: 'BGM', iwsPercent: '0.60', iwsPercentValue: '9232' },
      { orderNr: 4, orderLabel: 'SM', orderType: 'Small', orderDate: '18.03.2025', acronym: 'OSM', fundingProgram: 'Horizon', value: '33091', contractStatus: 'Accepted', contractNr: '128-730-374', contractTitle: 'VMR', iwsPercent: '0.50', iwsPercentValue: '4922' },
      { orderNr: 5, orderLabel: 'MD', orderType: 'Medium', orderDate: '02.04.2025', acronym: 'OMD', fundingProgram: 'LakeView', value: '42712', contractStatus: 'Pending', contractNr: '129-730-374', contractTitle: 'STD', iwsPercent: '0.80', iwsPercentValue: '6139' }
    ];
  }
}

