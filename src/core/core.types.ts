export interface CloudinaryImage {
  url: string;
  public_id: string;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: ErrorDetail[];
  };
}
