import { Injectable } from '@angular/core';
import { OrderCommission } from '../../../../../Entities/orderCommission';

@Injectable({
  providedIn: 'root'
})

export class OrderCommissionService {
  private readonly orderCommission: OrderCommission[] = [
    {
      fromOrderValue: 1,
      commission: '347859',
      minCommission: '347800',
    },
    {
      fromOrderValue: 2,
      commission: '5647893',
      minCommission: '5647000',
    },
    {
      fromOrderValue: 3,
      commission: '92388',
      minCommission: '92300',
    },
    {
      fromOrderValue: 4,
      commission: '59876',
      minCommission: '59800',
    },
    {
      fromOrderValue: 5,
      commission: '602387',
      minCommission: '602000'
    },
    {
      fromOrderValue: 6,
      commission: '602849',
      minCommission: '602800',
    },
    {
      fromOrderValue: 7,
      commission: '923847',
      minCommission: '923800',
    },
    {
      fromOrderValue: 8,
      commission: '937489',
      minCommission: '937400',
    },
    {
      fromOrderValue: 9,
      commission: '345268',
      minCommission: '345200',
    },
    {
      fromOrderValue: 10,
      commission: '938475',
      minCommission: '938400',
    },
    {
      fromOrderValue: 11,
      commission: '934894',
      minCommission: '934800',
    },
    {
      fromOrderValue: 12,
      commission: '237489',
      minCommission: '237400',
    },
    {
      fromOrderValue: 13,
      commission: '937485',
      minCommission: '937400',
    },
    {
      fromOrderValue: 14,
      commission: '347462',
      minCommission: '347400',
    },
    {
      fromOrderValue: 15,
      commission: '573892',
      minCommission: '573800',
    }
  ];

  constructor() { }

  getOrderCommission(): OrderCommission[] {
    return this.orderCommission;
  }
}
