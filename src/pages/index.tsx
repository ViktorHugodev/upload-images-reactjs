import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { CardList } from '../components/CardList'
import { Header } from '../components/Header';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface DataProps {
  after: string;
  data: ImageProps[]
}

interface ImageProps {
  title: string;
  description: string;
  url: string;
  ts: number
  id: string
}

export default function Home(): JSX.Element {
  async function fetchImg({ pageParam = null }): Promise<DataProps> {
    const { data } = await api.get('/api/images', {
      params: {
        after: pageParam
      }
    })

    return data
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(
    'images', fetchImg, {
    getNextPageParam: lastPage => lastPage?.after
  })

  const formattedData = useMemo(() => {
    const formatted = data?.pages.flatMap(imgData => {
      return imgData.data.flat();
    });
    return formatted;
  }, [data]);

  if (isLoading && !isError) {
    return <Loading />;
  }

  if (!isLoading && isError) {
    return <Error />;
  }
  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}