import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetPostsQuery, useGetUserPostsQuery } from '../api/postApi';
import { PaginationLinkData } from '@/components/Pagination/Pagination';
import { getErrorMessage } from '@/api/utils';

type useSearchPostsWithPaginationProps = {
  userId?: string;
  defaultValues?: {
    query: string;
    skip: number;
    limit: number;
  };
};

export const useSearchPostsWithPagination = (props: useSearchPostsWithPaginationProps = {}) => {
  const { userId, defaultValues = { query: '', skip: 0, limit: 10 } } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') ?? defaultValues.limit.toString());
  const skip = parseInt(searchParams.get('skip') ?? defaultValues.skip.toString());
  const query = searchParams.get('query') ?? defaultValues.query;

  const { data, isFetching, isLoading, error } = userId
    ? useGetUserPostsQuery({ userId, skip, limit })
    : useGetPostsQuery({ skip, limit, query });

  const handleSearchChange = (value: string) => {
    if (value !== query) {
      searchParams.delete('skip');
      searchParams.delete('limit');
    }
    if (value !== '') {
      searchParams.set('query', value);
    } else {
      searchParams.delete('query');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const generatePaginationLink = ({ index, limit }: PaginationLinkData) => {
    const newSearchParams = new URLSearchParams();
    if (query) {
      newSearchParams.set('query', query);
    }
    newSearchParams.set('skip', (index * limit).toString());
    newSearchParams.set('limit', limit.toString());
    return `/posts?${newSearchParams.toString()}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [query, limit, skip]);

  return {
    searchParams,
    handleSearchChange,
    query,
    skip,
    limit,
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    isLoading: isFetching || isLoading,
    error: error ? getErrorMessage(error) : '',
    generatePaginationLink,
  };
};
