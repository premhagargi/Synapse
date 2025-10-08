export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  private readonly stringifiedContext: string;

  constructor(context: SecurityRuleContext) {
    const stringifiedContext = JSON.stringify(
      {
        path: context.path,
        operation: context.operation,
        requestResourceData: context.requestResourceData,
      },
      null,
      2
    );

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${stringifiedContext}`;
    super(message);

    this.name = 'FirestorePermissionError';
    this.context = context;
    this.stringifiedContext = stringifiedContext;

    // This is to make the error message more readable in the browser console.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  public toString() {
    return this.message;
  }
}
