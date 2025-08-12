export type Meta = {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
};

export type UseQueryOptions = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;
}

export type ActionResponse<T> = Promise<{
  success: boolean;
  message: string;
  data?: T;
}>
