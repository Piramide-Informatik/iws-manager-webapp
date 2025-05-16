export const MASTER_DATA_MENU_ITEM = { 
  label: 'MENU.MASTER_DATA', 
  icon: 'pi pi-cog', 
  items: [
    {
      label: 'PEOPLE',
      isActive: false,
      items: [
        { label: 'USER', path: 'user' },
        { label: 'ROLES', path: 'roles' },
        { label: 'IWS_STAFF', path: 'iws-staff' },
        { label: 'IWS_COMMISSIONS', path: 'iws-commissions' },
        { label: 'IWS_TEAMS', path: 'iws-teams' },
        { label: 'EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
      ],
    },
    {
      label: 'FINANCE',
      isActive: false,
      items: [
        { label: 'FUNDING_PROGRAMS', path: 'funding-programs' },
        { label: 'COST', path: 'cost' },
        { label: 'BILLERS', path: 'billers' },
        { label: 'SALES_TAX', path: 'sales-tax' },
        { label: 'DUNNING_LEVELS', path: 'dunning-levels' },
        { label: 'BILLING_METHODS', path: 'billing-methods' },
        { label: 'TERMS_OF_PAYMENT', path: 'terms-payment' },
        { label: 'CONTRACT_STATUS', path: 'contract-status' },
      ],
    },
    {
      label: 'OPERATIONS',
      isActive: false,
      items: [
        { label: 'ORDER_TYPES', path: 'order-types' },
        { label: 'APPROVAL_STATUS', path: 'approval-status' },
        { label: 'ABSENCE_TYPES', path: 'absence-types' },
        { label: 'HOLIDAYS', path: 'holidays' },
        { label: 'STATES', path: 'states' },
        { label: 'NETWORKS', path: 'networks' },
      ],
    },
    {
      label: 'LOCATION',
      isActive: false,
      items: [
        { label: 'ADDRESS', path: 'address' },
        { label: 'COUNTRIES', path: 'countries' },
        { label: 'TITLE', path: 'title' },
      ],
    },
    {
      label: 'PROJECTS',
      isActive: false,
      items: [
        { label: 'PROJECT_STATUS', path: 'project-status' },
        { label: 'PROJECT_FUNNELS', path: 'project-funnels' },
        { label: 'REALIZATION_PROBABILITIES', path: 'realization-probabilities' },
      ],
    },
    {
      label: 'CONFIGURATION',
      isActive: false,
      items: [
        { label: 'SYSTEM_CONSTANTS', path: 'system-constants' },
        { label: 'TEXTS', path: 'texts' },
        { label: 'TYPES_OF_COMPANIES', path: 'type-companies' },
      ],
    },
  ]
}