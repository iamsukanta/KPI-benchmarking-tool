export interface GenericSuccessResponse {
  status: 'success';
}

export interface GenericSuccessWithMessageResponse extends GenericSuccessResponse {
  message: string;
}

interface GenerciErrorResponse {
  status: 'error';
}

export interface GenericErrorWithMessageResponse extends GenerciErrorResponse {
  message: string;
}

export interface GenericValidationErrorResponse extends GenerciErrorResponse {
  errors: Record<string, string[]>;
}
