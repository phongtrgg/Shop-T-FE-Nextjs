import type {
  CategoryQueryOptions,
  NextPageWithLayout,
  ProductQueryOptions,
  SettingsQueryOptions,
} from '@/types';
import type { GetStaticProps } from 'next';
import Layout from '@/layouts/_layout';
import { useProducts } from '@/data/product';
import Grid from '@/components/product/grid';
import { useRouter } from 'next/router';
import Seo from '@/layouts/_seo';
import routes from '@/config/routes';
import client from '@/data/client';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import CategoryFilter from '@/components/product/category-filter';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useAuth from '@/components/auth/use-auth';
import { setAuthCredentials } from '@/data/client/token.utils';
import { useState, useEffect } from 'react';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  try {
    await Promise.all([
      queryClient.prefetchQuery(
        [API_ENDPOINTS.SETTINGS, { language: locale }],
        ({ queryKey }) =>
          client.settings.all(queryKey[1] as SettingsQueryOptions),
      ),
      queryClient.prefetchInfiniteQuery(
        [API_ENDPOINTS.PRODUCTS, { language: locale }],
        ({ queryKey }) =>
          client.products.all(queryKey[1] as ProductQueryOptions),
      ),
      queryClient.prefetchInfiniteQuery(
        [API_ENDPOINTS.CATEGORIES, { limit: 100, language: locale }],
        ({ queryKey }) =>
          client.categories.all(queryKey[1] as CategoryQueryOptions),
      ),
    ]);
    return {
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: 60, // In seconds
    };
  } catch (error) {
    //* if we get here, the product doesn't exist or something else went wrong
    return {
      notFound: true,
    };
  }
};

function Products() {
  const { query } = useRouter();
  const { products, loadMore, hasNextPage, isLoadingMore, isLoading } =
    useProducts({
      ...(query.category && { categories: query.category }),
      ...(query.price && { price: query.price }),
      sortedBy: 'DESC',
    });
  return (
    <Grid
      products={products}
      limit={30}
      onLoadMore={loadMore}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoadingMore}
      isLoading={isLoading}
    />
  );
}

// TODO: SEO text gulo translation ready hobe kina? r seo text gulo static thakbe or dynamic?
const Home: NextPageWithLayout = () => {
  const { authorize } = useAuth();
  const { query, push } = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const tokenApp = query.tokenapp as string;
  const hashTokenShop = query.hashtokenshop as string;
  const { data, isLoading, error } = useQuery<any>(
    [API_ENDPOINTS.ACCOUNT, { tokenApp, hashTokenShop }],
    () =>
      tokenApp &&
      hashTokenShop &&
      client.users.autoLogin({ tokenApp, hashTokenShop }),
  );
  useEffect(() => {
    if (data && data.tokenShop) {
      authorize(data.tokenShop);
      setAuthCredentials(data.tokenShop, 'customers');
      setIsLogin(true);
    }
  }, [data, tokenApp, hashTokenShop]);

  useEffect(() => {
    if (isLogin) {
      push('/');
    }
  }, [isLogin]);
  return (
    <>
      <Seo
        title="Tomiru E-COMMERCE"
        description="Tomiru E-COMMERCE"
        url={routes.home}
      />
      <CategoryFilter />
      <Products />
    </>
  );
};

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Home;
