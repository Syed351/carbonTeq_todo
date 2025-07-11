class ApiError extends Error {
  statusCode: number;
  message: string;
//   errors : string[] | null;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = 'ApiError';
    // this.errors = errors;
}
}

export default ApiError;
