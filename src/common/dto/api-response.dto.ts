export class ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message?: string;
  meta?: any;

  constructor(data: T | null, message?: string, meta?: any) {
    this.status = data === null ? 'error' : 'success';
    this.data = data;
    this.message = message;
    this.meta = meta;
  }
}
