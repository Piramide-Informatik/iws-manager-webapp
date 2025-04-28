export interface ContactPerson {
    uuid: string;
    id: number;
    firstName: string;
    lastName: string;
    forInvoincing?: number;
    function?: string;     
    salutationId: number;
    titleId: number;
    customerId?: number;   
}