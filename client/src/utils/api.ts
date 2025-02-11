// utils/api.ts
import { AxiosError } from 'axios';

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, string[]>;
}

export function isApiError(error: unknown): error is AxiosError<ApiError> {
    return error instanceof AxiosError && error.response?.data?.code !== undefined;
}

export function handleApiError(error: unknown): ApiError {
    if (isApiError(error)) {
        return error.response!.data;
    }
    return {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}
