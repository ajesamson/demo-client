export class ApiResponseDto<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  error: string | null;
}
