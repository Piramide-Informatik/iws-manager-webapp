import { ContactPerson } from "./contactPerson";
import { Customer } from "./customer";
import { Network } from "./network";

export interface NetworkPartner {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  comment?: string;
  contact?: ContactPerson;
  partner?: Customer;
  network?: Network;
  partnerno?: number;
}