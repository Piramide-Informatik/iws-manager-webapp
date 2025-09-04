export type OccErrorType = 'UPDATE_UPDATED' | 'UPDATE_UNEXISTED' | 'DELETE_UNEXISTED';

export class OccError extends Error {
  constructor(
    message: string,
    public readonly errorType: OccErrorType,
    public readonly entityName?: string
  ) {
    super(message);
    this.name = 'OccError';
  }
}

// Conflict when updating a record that has already been updated by other user
export function createUpdateConflictError(entityName?: string): OccError {
  const message = entityName 
    ? `${entityName} was modified by another user`
    : 'Record was modified by another user';
  
  return new OccError(message, 'UPDATE_UPDATED', entityName);
}
// Conflict when updating a record that has already been deleted by other user
export function createNotFoundUpdateError(entityName?: string): OccError {
  const message = entityName
    ? `${entityName} not found for update`
    : 'Record not found for update';
  
  return new OccError(message, 'UPDATE_UNEXISTED', entityName);
}
// Conflict when deleting a record that has already been deleted by other user
export function createNotFoundDeleteError(entityName?: string): OccError {
  const message = entityName
    ? `${entityName} not found for deletion`
    : 'Record not found for deletion';
  
  return new OccError(message, 'DELETE_UNEXISTED', entityName);
}