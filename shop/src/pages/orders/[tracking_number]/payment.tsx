import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dayjs from 'dayjs';
import { GetServerSideProps } from 'next';
import isEmpty from 'lodash/isEmpty';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactConfetti from 'react-confetti';
import type { NextPageWithLayout } from '@/types';
import GeneralLayout from '@/layouts/_general-layout';
import { useWindowSize } from '@/lib/hooks/use-window-size';
import { useCart } from '@/components/cart/lib/cart.context';
import { useTranslation } from 'next-i18next';
import { dehydrate, QueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import client from '@/data/client';
import type { SettingsQueryOptions } from '@/types';
import usePrice from '@/lib/hooks/use-price';
import OrderViewHeader from '@/components/orders/order-view-header';
import OrderStatusProgressBox from '@/components/orders/order-status-progress-box';
import { OrderStatus, PaymentStatus } from '@/types';
import { formatString } from '@/lib/format-string';
import { OrderItems } from '@/components/orders/order-items';
import { CheckMark } from '@/components/icons/checkmark';
import SuborderItems from '@/components/orders/suborder-items';
import { useOrder } from '@/data/order';
import { useModalAction } from '@/components/modal-views/context';
import { PageLoader } from '@/components/ui/loader/spinner/spinner';
import { Order } from '@/types';
import ErrorMessage from '@/components/ui/error-message';
import { getOrderPaymentSummery } from '@/lib/get-order-payment-summery';
import OrderOTP from '@/components/otp/otp-popup';
import { useState } from 'react';
import Image from '@/components/ui/image';
import { refreshOrderPageAtom } from '@/components/cart/lib/checkout';

import { useAtom } from 'jotai';
type Props = {
  title: string;
  details: string | undefined | number;
};

const Card = ({ title, details }: Props) => {
  return (
    <div className="flex min-h-[6.5rem] items-center rounded border border-gray-200 py-4 px-6 dark:border-[#434343] dark:bg-dark-200">
      <div>
        <h3 className="mb-2 text-xs font-normal dark:text-white/60">
          {title} :{' '}
        </h3>
        <p className="text-dark-200 dark:text-white">{details}</p>
      </div>
    </div>
  );
};

const Listitem = ({ title, details }: Props) => {
  return (
    <p className="text-body-dark mt-5 flex items-center text-base">
      <strong className="w-5/12 sm:w-4/12">{title}</strong>
      <span>:</span>
      <span className="w-7/12 ltr:pl-4 rtl:pr-4 dark:text-white sm:w-8/12 text-base ">
        {details}
      </span>
    </p>
  );
};
interface OrderViewProps {
  order: Order | undefined;
  loadingStatus?: boolean;
}

const OrderView = ({ order, loadingStatus }: OrderViewProps) => {
  const { t } = useTranslation('common');
  const { width, height } = useWindowSize();
  const [showOTP, setShowOTP] = useState(false);

  const { resetCart } = useCart();
  useEffect(() => {
    resetCart();
  }, []);

  const { price: total } = usePrice({ amount: order?.paid_total! });
  const { price: wallet_total } = usePrice({
    amount: order?.wallet_point?.amount!,
  });
  const { price: sub_total } = usePrice({ amount: order?.amount! });
  const { price: tax } = usePrice({ amount: order?.sales_tax ?? 0 });

  const { is_payment_gateway_use, is_full_paid, amount_due, gateway_payment } =
    getOrderPaymentSummery(order!);
  const paymentGatway = order?.payment_gateway;

  const { price: amountDue } = usePrice({ amount: amount_due });
  const { price: gatewayPayment } = usePrice({ amount: gateway_payment });
  const formatItem =
    order?.products?.length !== undefined && order.products.length < 10
      ? `0${order.products.length}`
      : order?.products?.length ?? 0;

  return (
    <div className="p-4 sm:p-8">
      {showOTP && order?.payment_gateway === 'TOMXU' && (
        <OrderOTP
          showOTP={setShowOTP}
          id={order?.tracking_number}
          email={order?.customer.email}
          order={order}
        />
      )}
      <div className="mx-auto w-full max-w-screen-lg">
        <div className="relative overflow-hidden rounded">
          <OrderViewHeader
            order={order}
            buttonSize="small"
            loading={loadingStatus}
            action={setShowOTP}
          />
          <div className="bg-light px-6 pb-12 pt-2 dark:bg-dark-200 lg:px-8">
            {paymentGatway !== 'TOMXU' && (
              <div className="leading-1 my-10 ">
                <h1 className="text-xl font-semibold my-5">
                  Để hoàn tất đơn hàng, quý khách vui lòng chuyển khoản theo nội
                  dung sau :
                </h1>
                <div className="flex flex-col md:flex-row  items-center justify-around border-solid border-2 rounded-md shadow bg-white py-6 gap-6">
                  <div className="leading-1  flex flex-col gap-3  ">
                    <div className="flex ml-2 md:ml-0 items-center justify-between gap-10 text-base">
                      Ngân hàng :
                      <span className="font-semibold mx-5 ">TECHCOMBANK</span>
                    </div>
                    <div className="flex ml-2 md:ml-0 items-center justify-between gap-10 text-base">
                      Số Tài Khoản :
                      <span className="font-semibold text-red-500 text-lg mx-5">
                        19029648516011
                      </span>
                    </div>
                    <div className="flex ml-2 md:ml-0 items-center justify-between gap-10 text-base">
                      Chủ tài khoản :
                      <span className="font-semibold mx-5">
                        Nguyễn Hữu Kiên
                      </span>
                    </div>
                    <div className="flex ml-2 md:ml-0 items-center justify-between gap-10 text-base">
                      Số tiền :
                      <span className="font-semibold mx-5 text-red-500 text-xl">
                        {total}
                      </span>
                    </div>
                    <div className="flex ml-2 md:ml-0 items-center justify-between gap-10 text-base">
                      Nội dung :
                      <span className="font-semibold  mx-5">
                        {order?.tracking_number}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Image
                      src="/icons/qr_nhk.png"
                      alt="tcb-img"
                      width={`${200}`}
                      height={`${200}`}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* CARD */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 md:mb-12 lg:grid-cols-4 text-base">
              <Card
                title={t('text-order-number')}
                details={order?.tracking_number}
              />
              <Card
                title={t('text-date')}
                details={dayjs(order?.created_at).format('MMMM D, YYYY')}
              />
              <Card
                title={t('text-total')}
                details={
                  order?.payment_gateway === 'TOMXU'
                    ? `${order.total_tomxu} Tomxu`
                    : total
                }
              />
              <Card
                title={t('text-payment-method')}
                details={order?.payment_gateway ?? 'N/A'}
              />
            </div>

            <div className="mt-12 flex flex-col justify-around md:flex-row xs:flex-col gap-10 text-base">
              <div className="w-full md:w-1/2 ltr:md:pl-3 rtl:md:pr-3">
                {/* <div className="w-full md:w-1/2 ltr:md:pl-3 rtl:md:pr-3"> */}
                <h2 className="mb-6 text-lg font-medium dark:text-white ">
                  {t('text-order-status')}
                </h2>
                <div>
                  <OrderStatusProgressBox
                    orderStatus={order?.order_status as OrderStatus}
                    paymentStatus={order?.payment_status as PaymentStatus}
                  />
                </div>
              </div>
              {/* end of order details */}

              <div className="mb-10  w-full md:mb-0 md:w-1/2 ltr:md:pl-3 rtl:md:pl-3 text-base   ">
                {/* <div className="mb-10 w-full md:mb-0 md:w-1/2 ltr:md:pl-3 rtl:md:pl-3"> */}
                <h2 className="mb-0 md:mb-6 text-base font-medium dark:text-white ">
                  {t('text-order-details')}
                </h2>
                <div className="text-base">
                  <Listitem title={t('text-total-item')} details={formatItem} />
                  <Listitem title={'Đơn giá'} details={sub_total} />
                  <Listitem title={t('text-tax')} details={tax} />
                  <div className="w-1/2 border-b border-solid border-gray-200 py-1 dark:border-b-[#434343]" />
                  <Listitem title={t('text-total')} details={total} />
                  {wallet_total && (
                    <Listitem
                      title={t('text-paid-from-wallet')}
                      details={wallet_total}
                    />
                  )}

                  {is_payment_gateway_use && is_full_paid && (
                    <Listitem
                      title={`${order?.payment_gateway} ${t('payment')}`}
                      details={gatewayPayment}
                    />
                  )}
                </div>
              </div>
              {/* end of total amount */}
            </div>
            <div className="mt-12">
              <OrderItems
                products={order?.products}
                orderId={order?.id}
                status={order?.payment_status as PaymentStatus}
              />
            </div>
            {/* {!isEmpty(order?.children) ? (
              <div className="mt-10">
                <h2 className="mb-6 text-base font-medium dark:text-white">
                  {t('text-sub-orders')}
                </h2>
                <div>
                  <div className="flex items-start p-4 mb-12 border border-gray-200 rounded dark:border-dark-600">
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-dark px-2 ltr:mr-3 rtl:ml-3 dark:bg-light">
                      <CheckMark className="w-2 h-2 shrink-0 text-light dark:text-dark" />
                    </span>
                    <p className="text-sm text-heading">
                      <span className="font-bold">{t('text-note')}:</span>{' '}
                      {t('message-sub-order')}
                    </p>
                  </div>
                  {Array.isArray(order?.children) && order?.children.length && (
                    <SuborderItems items={order?.children} />
                  )}
                </div>
              </div>
            ) : null} */}
          </div>
        </div>
      </div>
      {order && order.payment_status === PaymentStatus.SUCCESS ? (
        <ReactConfetti
          width={width - 10}
          height={height}
          recycle={false}
          tweenDuration={8000}
          numberOfPieces={300}
        />
      ) : (
        ''
      )}
    </div>
  );
};

const OrderPage: NextPageWithLayout = () => {
  const [refreshOrder, setRefreshOrder] = useAtom(refreshOrderPageAtom);
  const { query } = useRouter();
  const { openModal } = useModalAction();
  const { order, isLoading, error, isFetching, refetch } = useOrder({
    tracking_number: query.tracking_number!.toString(),
  });

  const { payment_status, payment_intent, tracking_number } = order ?? {};

  useEffect(() => {
    if (refreshOrder === true) {
      refetch();
      setRefreshOrder(false);
    }
  }, [refreshOrder]);
  useEffect(() => {
    if (
      payment_status === PaymentStatus.PENDING &&
      payment_intent?.payment_intent_info &&
      !payment_intent?.payment_intent_info?.is_redirect
    ) {
      openModal('PAYMENT_MODAL', {
        paymentGateway: payment_intent?.payment_gateway,
        paymentIntentInfo: payment_intent?.payment_intent_info,
        trackingNumber: tracking_number,
      });
    }
  }, [payment_status, payment_intent?.payment_intent_info]);

  if (isLoading) {
    return <PageLoader showText={false} />;
  }

  if (error) return <ErrorMessage message={error?.message} />;

  return <OrderView order={order} loadingStatus={!isLoading && isFetching} />;
};

OrderPage.authorization = true;
OrderPage.getLayout = function getLayout(page: any) {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export default OrderPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions),
  );

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
