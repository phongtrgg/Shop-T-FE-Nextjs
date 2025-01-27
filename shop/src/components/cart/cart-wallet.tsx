import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import usePrice from '@/lib/hooks/use-price';
import CheckBox from '@/components/ui/forms/checkbox';
import { isNegative } from '@/lib/is-negative';
import {
  payableAmountAtom,
  useWalletPointsAtom,
} from '@/components/cart/lib/checkout';
import { useTranslation } from 'next-i18next';
import { useMutation } from 'react-query';
import client from '@/data/client';
import { useMe } from '@/data/user';
import useUserTomxu from '@/lib/hooks/use-user-tomxu';
interface Props {
  totalPrice: number;
  walletAmount: number;
  walletCurrency: number;
}
import useCryptData from '@/lib/hooks/use-crypt-data';

export default function CartWallet({
  totalPrice,
  walletAmount,
  walletCurrency,
}: Props) {
  const { userTomxu } = useUserTomxu();
  const { t } = useTranslation('common');
  const { me } = useMe();

  const [use_wallet, setUseWallet] = useAtom(useWalletPointsAtom);
  const [calculatePayableAmount, setCalculatePayableAmount] =
    useAtom(payableAmountAtom);
  const [calculateCurrentWalletCurrency, setCalculateCurrentWalletCurrency] =
    useState(walletCurrency);

  const { price: currentWalletCurrency } = usePrice({
    amount: Number(calculateCurrentWalletCurrency),
  });
  const { price: payableAmount } = usePrice({
    amount: calculatePayableAmount,
  });
  useEffect(() => {
    if (use_wallet) {
      const calculatedCurrentWalletCurrencyAfterPayment =
        walletCurrency - totalPrice;
      if (isNegative(calculatedCurrentWalletCurrencyAfterPayment)) {
        setCalculateCurrentWalletCurrency(0);
        setCalculatePayableAmount(
          Math.abs(calculatedCurrentWalletCurrencyAfterPayment),
        );
      } else {
        setCalculateCurrentWalletCurrency(
          calculatedCurrentWalletCurrencyAfterPayment,
        );
        setCalculatePayableAmount(0);
      }
    } else {
      setCalculateCurrentWalletCurrency(walletCurrency);
      setCalculatePayableAmount(0);
    }
  }, [setCalculatePayableAmount, totalPrice, use_wallet, walletCurrency]);

  return (
    <div>
      <div className="mt-2 space-y-3">
        {/* <div className="text-body flex justify-between">
          <span>{t('text-wallet-points-title')}</span>
          <span>{walletAmount}</span>
        </div> */}
        <div className="text-body flex justify-between">
          <span>{t('text-wallet-currency')}</span>
          <span className="font-bold">{userTomxu} TOMXU</span>
        </div>
      </div>

      {/* <CheckBox
        name="use_wallet"
        label="text-wallet-input-label"
        onChange={() => setUseWallet(!use_wallet)}
        checked={use_wallet}
        className={cn(
          'mt-4 mb-7 flex-row-reverse rounded border border-light-400 bg-light-100 py-2.5 hover:bg-transparent ltr:pr-2.5 rtl:pl-2.5 dark:border-dark-500/80 dark:bg-dark-400/80 dark:hover:bg-transparent',
          !walletAmount ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
        disabled={!walletAmount}
      /> */}

      {/* {use_wallet && (
        <div className="mt-1 mb-7 flex justify-between border-t-4 border-double border-light-400 pt-4 dark:border-dark-400">
          <span className="text-heading text-15px font-semibold">
            Payable Amount
          </span>
          <span className="text-heading text-15px font-semibold">
            {payableAmount}
          </span>
        </div>
      )} */}
    </div>
  );
}
