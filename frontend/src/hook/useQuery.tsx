import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const useQuery = <T extends { [k: string]: string }>() => {
  const [searchParams] = useSearchParams();

  return useMemo<T>(() => Object.fromEntries([...searchParams]) as T, [searchParams]);
};

export default useQuery;
