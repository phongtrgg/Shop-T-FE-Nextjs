import type { NextPageWithLayout } from '@/types';
import { useRouter } from 'next/router';
import routes from '@/config/routes';
import GeneralLayout from '@/layouts/_general-layout';
import CartItemList from '@/components/cart/cart-item-list';
import CartEmpty from '@/components/cart/cart-empty';
import Button from '@/components/ui/button';
import PhoneInput from '@/components/ui/forms/phone-input';
import { useCart } from '@/components/cart/lib/cart.context';
import usePrice from '@/lib/hooks/use-price';
import Seo from '@/layouts/_seo';
import { LongArrowIcon } from '@/components/icons/long-arrow-icon';
import client from '@/data/client';
import { useMutation } from 'react-query';
import CartCheckout from '@/components/cart/cart-checkout';
import { useMe } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/forms/input';
import Textarea from '@/components/ui/forms/textarea';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

const CheckoutPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { me } = useMe();
  const { t } = useTranslation('common');
  const userPhone = me?.phone;
  const userGmail = me?.email;
  const userName = `${me?.first_name} ${me?.last_name}`;
  const phoneValue = userPhone?.slice(3);
  const fullName = useRef<HTMLInputElement>(null);
  const gmail = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLTextAreaElement>(null);
  const {
    items,
    total,
    totalItems,
    isEmpty,
    setVerifiedResponse,
    verifiedResponse,
  } = useCart();

  useEffect(() => {
    if (!isEmpty && Boolean(verifiedResponse) && phone.current && phoneValue) {
      phone.current.value = String(phoneValue);
    }
    if (!isEmpty && Boolean(verifiedResponse) && gmail.current && userGmail) {
      gmail.current.value = userGmail;
    }
    if (!isEmpty && Boolean(verifiedResponse) && fullName.current && userName) {
      fullName.current.value = String(userName);
    }
  }, [isEmpty, verifiedResponse]);

  const { price: totalPrice } = usePrice({
    amount: total,
  });
  const { mutate, isLoading } = useMutation(client.orders.verify, {
    onSuccess: (res) => {
      setVerifiedResponse(res);
    },
    onError: (error: any) => {
      const {
        response: { data },
      }: any = error ?? {};
      toast.error(data?.message);
    },
  });
  function verify() {
    mutate({
      amount: total,
      products: items.map((item) => ({
        product_id: item.id,
        order_quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      })),
    });
  }
  const [errorMessage, setErrorMessage] = useState<any>({
    fullName: '',
    phone: '',
    address: '',
    gmail: '',
  });
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Vui lòng không để trống Họ Tên'),
    phone: Yup.string()
      .nullable(undefined)
      .matches(/^\d+$/, 'Số điện thoại phải là số')
      .required('Vui lòng không để trống số điện thoại'),
    gmail: Yup.string()
      .trim()
      .email('Vui lòng nhập đúng định dạng email')
      .required('Vui lòng không để trống gmail'),
    address: Yup.string().required('Vui lòng không để trống địa chỉ'),
  });

  const handleBlur = async () => {
    try {
      await validationSchema.validate(
        {
          fullName: fullName.current?.value,
          phone: phone.current?.value,
          address: address.current?.value,
          gmail: gmail.current?.value,
        },
        { abortEarly: false },
      );
      setErrorMessage({
        fullName: '',
        phone: '',
        address: '',
        gmail: '',
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        error.inner.forEach((err: Yup.ValidationError) => {
          if (err.path && typeof err.path === 'string') {
            newErrors[err.path] = err.message;
          }
        });
        setErrorMessage(newErrors);
      }
    }
  };
  return (
    <>
      <Seo
        title="Checkout"
        description="Fastest digital download template built with React, NextJS, TypeScript, React-Query and Tailwind CSS."
        url={routes?.checkout}
      />
      <div className="mx-auto flex h-full w-full max-w-screen-sm flex-col p-4  pt-6 sm:p-5 sm:pt-8 md:pt-10 3xl:pt-12">
        {!isEmpty && Boolean(verifiedResponse) ? (
          <div className="mb-4 bg-light shadow-card dark:bg-dark-250 dark:shadow-none md:mb-5 3xl:mb-6 pb-6">
            <h2 className="flex items-center justify-between border-b border-light-400 px-5 py-4 text-sm font-medium text-dark dark:border-dark-400 dark:text-light sm:py-5 sm:px-7 md:text-base">
              {t('text-checkout-title')}
            </h2>
            <div className="px-5 py-3 sm:py-3 sm:px-7 flex justify-between">
              <Input
                placeholder="Họ và Tên"
                onBlur={handleBlur}
                ref={fullName}
                error={errorMessage.fullName ? errorMessage.fullName : ''}
              />
              <Input
                placeholder="Số điện thoại "
                ref={phone}
                onBlur={handleBlur}
                error={errorMessage.phone ? errorMessage.phone : ''}
              />
            </div>
            <div className="px-5 py-3 sm:py-3 sm:px-7 ">
              <Input
                placeholder="Gmail "
                ref={gmail}
                onBlur={handleBlur}
                error={errorMessage.gmail ? errorMessage.gmail : ''}
              />
            </div>
            <div className="px-5 py-3 sm:py-3 sm:px-7 flex justify-between">
              <Input placeholder="Thành Phố " />
              <Input placeholder="Quận / Huyện" />
            </div>
            <div className="px-5 py-3 sm:py-3 sm:px-7">
              <Textarea
                placeholder="Địa Chỉ Chi Tiết"
                inputClassName="min-h-[75px]"
                error={errorMessage.address ? errorMessage.address : ''}
                ref={address}
                onBlur={handleBlur}
              />
            </div>
          </div>
        ) : null}

        <div className="bg-light shadow-card dark:bg-dark-250 dark:shadow-none">
          <h2 className="flex items-center justify-between border-b border-light-400 px-5 py-4 text-sm font-medium text-dark dark:border-dark-400 dark:text-light sm:py-5 sm:px-7 md:text-base">
            {t('text-checkout-title-two')}
            <span className="font-normal text-dark-700">({totalItems})</span>
          </h2>
          <div className="px-5 pt-9 sm:px-7 sm:pt-11">
            {!isEmpty ? (
              <CartItemList className="pl-3" />
            ) : (
              <>
                <CartEmpty />
                <div className="sticky bottom-11 z-[5] mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
                  <Button
                    onClick={() => router.push(routes.home)}
                    className="w-full md:h-[50px] md:text-sm"
                  >
                    <LongArrowIcon className="h-4 w-4" />
                    {t('404-back-home')}
                  </Button>
                </div>
              </>
            )}

            {!isEmpty && !Boolean(verifiedResponse) && (
              <div className="sticky bottom-11 z-[5] mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
                <div className="mb-6 flex flex-col gap-3 text-dark dark:text-light sm:mb-7">
                  <div className="flex justify-between">
                    <p>{t('text-subtotal')}</p>
                    <strong className="font-semibold">{totalPrice}</strong>
                  </div>
                  <div className="flex justify-between">
                    <p>{t('text-tax')}</p>
                    <strong className="font-semibold">
                      {t('text-calculated-checkout')}
                    </strong>
                  </div>
                </div>
                <Button
                  className="w-full md:h-[50px] md:text-sm"
                  onClick={verify}
                  isLoading={isLoading}
                >
                  {t('text-check-availability')}
                </Button>
              </div>
            )}
            {!isEmpty && Boolean(verifiedResponse) && (
              <CartCheckout
                customer_name={fullName.current?.value}
                phone={phone.current?.value}
                address={address.current?.value}
                email={gmail.current?.value}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

CheckoutPage.authorization = true;
CheckoutPage.getLayout = function getLayout(page) {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60, // In seconds
  };
};

export default CheckoutPage;
