import { useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import client from '@/data/client';
import toast from 'react-hot-toast';

import { useRef, useState, useEffect } from 'react';
import CryptData from '@/lib/hooks/use-crypt-data';
import { useMe } from '@/data/user';
import useCountdownTimer from '@/lib/hooks/use-CountdownTimer';

import OtpInput from '@/components/otp/otp-input';
import OptionOTP from '@/components/otp/optionOTP';
import ThankYou from '@/pages/orders/[tracking_number]/thank-you';
import { CloseIcon, CloseIconNew } from '../icons/close-icon';

const OTPpopup = (props: any) => {
  const [otpValue, setOtpValue] = useState('');
  const [changeOption, setChangeOption] = useState(false);
  const [randomCard, setRandomCard] = useState<any>();
  const { me } = useMe();
  const { t } = useTranslation('common');
  const [thank, setThank] = useState(false);
  const token = '458875' + props.order.customer.id + props.order.customer.email;
  const [selectedOption, setSelectedOption] = useState<any>();
  const {
    minutes,
    remainingSeconds,
    startCountdown,
    isActive,
    setIsActive,
    seconds,
    setSeconds,
  } = useCountdownTimer();

  const { encryptData, data: encryptedToken, key, iv } = CryptData();
  useEffect(() => {
    encryptData(token, key, iv);
  }, [token]);

  useEffect(() => {
    if (isActive) {
      startCountdown();
    }
  }, [isActive]);

  const { mutate, isLoading, data } = useMutation(client.payment.post, {
    onSuccess: (res) => {
      toast.success(<b>{t('payment-success')}</b>);
      console.log('check res', res);
      setThank(true);
      setIsActive(false);
      setTimeout(() => {
        offTable();
      }, 10000);
    },
    onSettled: () => {
      console.log('check settled');
    },
    onError: (error: any) => {
      console.log('check err', error);
      toast.error(<b>{error.response.data.message}</b>);
    },
  });
  console.log(isLoading);
  function offTable() {
    props.showOTP(false);
    setThank(false);
  }

  function confirmHandler(e: any) {
    e.preventDefault();
    if (otpValue.length === 0 && !changeOption) {
      sendError('vui lòng không để trống thông tin');
      return toast.error(<b>{t('Vui lòng nhập OTP')}</b>);
    }
    if (!changeOption) {
      const sendData = {
        from_id: props.order.customer.id,
        from_user_email: props.order.customer.email,
        total_tomxu: props.order.total_tomxu,
        customer_contact: props.order.customer_contact,
        otp: otpValue,
        type_otp: 'verify_order',
        tracking_number: props.order.tracking_number,
        secret_token: encryptedToken,
        products: props.order.products.map((item: any) => ({
          product_id: item.id,
          quantity: Number(item.pivot.order_quantity),
          tomxu: item.tomxu,
          tomxu_subtotal: item.tomxu * item.pivot.order_quantity,
          shop_id: item.shop_id,
        })),
      };

      mutate(sendData);
    }
    if (changeOption) {
      setChangeOption(false);
    }
  }

  const { mutate: sendOTP, isLoading: ld } = useMutation(
    client.payment.sendOTP,
    {
      onSuccess: () => {
        setIsActive(true);
        setSeconds(120);
      },
      onError: (error: any) => {
        sendError('Yêu cầu gửi OTP của bạn không thành công');
        toast.error(<b>{t('text-profile-page-error-toast')}</b>);
      },
    },
  );

  function verify() {
    if (selectedOption) {
      const sendData = {
        user_id: props.order.customer.id,
        user_email: props.order.customer.email,
        type_otp: 'verify_order',
        total_tomxu: props.order.total_tomxu,
        secret_token: encryptedToken,
        method: selectedOption,
      };
      sendOTP(sendData);
    }
  }

  function OTPHandler(e: any) {
    e.preventDefault();
    if (seconds === 0 && selectedOption === 'card') {
      setIsActive(true);
      setSeconds(120);
      return randomNumber();
    }
    if (selectedOption !== 'card' && seconds === 0) {
      verify();
    }
  }

  useEffect(() => {
    if (seconds === 0 && selectedOption === 'card') {
      randomNumber();
    }
  }, [seconds]);
  useEffect(() => {
    if (me) {
      setSelectedOption(me?.default_otp_type.toString());
    }
  }, []);

  const [err, setErr] = useState<string>();
  function sendError(message: string) {
    setErr(message);
    setTimeout(() => {
      setErr('');
    }, 5000);
  }

  /**get OTP input */
  const handleOtpComplete = (otp: string) => {
    setOtpValue(otp);
  };
  /**go to selector OTP */
  const changeOptionHandler = () => {
    setChangeOption(true);
    setIsActive(false);
  };

  /**get type OTP (sms,email,card...)*/
  const handleSelectedOption = (event: any) => {
    setSelectedOption(event.target.value);
  };
  /**get random OTP card */
  const randomNumber = () => {
    setRandomCard(Math.floor(Math.random() * 35) + 1);
    setIsActive(true);
    setSeconds(120);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 top-0 bg-black bg-opacity-50 rounded-md ">
        {!thank && (
          <div className="relative w-472 h-auto mx-auto max-w-screen-sm flex-col p-6 pt-6 sm:p-5 sm:pt-8 md:pt-10 3xl:pt-12 bg-light shadow dark:bg-dark-250 dark:shadow-none text-center flex items-center justify-center rounded-lg ">
            <button
              onClick={offTable}
              className="absolute top-1 right-1 border-solid p-3 flex items-center  "
            >
              <CloseIconNew className="h-4 w-4 focus-visible:outline-none lg:h-[18px] lg:w-[18px] 3xl:h-5 3xl:w-5" />
            </button>
            {!changeOption && (
              <div className="mb-8 leading-tight relative h-auto">
                <h2 className="text-center  text-lg mb-10 font-bold">
                  Xác nhận OTP
                </h2>
                <div className="border border-b absolute top-10 w-full"></div>
                <div className="text-sm">
                  {selectedOption === 'email' && (
                    <>
                      <p>Quý khách vui lòng ấn gửi mã để nhận OTP</p>
                      {!isActive && (
                        <div className="flex justify-center">
                          <Button
                            variant="small"
                            className={`mt-3 rounded-lg`}
                            onClick={OTPHandler}
                          >
                            {selectedOption === 'card' ? 'Lấy số' : 'Gửi mã'}
                          </Button>
                        </div>
                      )}

                      {isActive ? (
                        <p>
                          <span className="font-bold">OTP</span> đã được gửi về{' '}
                          <span className="font-bold">{me?.email}</span>
                        </p>
                      ) : (
                        ''
                      )}
                    </>
                  )}
                  {selectedOption === 'sms' && (
                    <>
                      <p>Quý khách vui lòng nhập mã OTP đã được gửi về</p>
                      <p>số điện thoại : {props.order.customer_contact}</p>
                    </>
                  )}
                  {selectedOption === 'card' && (
                    <>
                      {isActive && (
                        <p>Quý khách vui lòng nhập mã OTP tương ứng số</p>
                      )}

                      {isActive && <p className=" text-xl">[ {randomCard} ]</p>}
                      {!isActive && (
                        <p className=" dark:text-white text-sm">
                          Xin hãy lấy số
                        </p>
                      )}
                      {isActive && (
                        <p className="text-sm">trên thẻ của quý khách</p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <div className="mt-3">
                    <OtpInput
                      onComplete={handleOtpComplete}
                      card={selectedOption === 'card' ? true : false}
                    />
                  </div>

                  {isActive && (
                    <p className="mt-5 text-red-400">
                      {minutes}:{remainingSeconds < 10 ? '0' : ''}
                      {remainingSeconds}
                    </p>
                  )}
                  {ld && (
                    <p className="text-red-400 mt-5">
                      Mã OTP của bạn đang được gửi
                    </p>
                  )}
                  {isLoading && (
                    <p className="text-red-400 mt-5">
                      Vui lòng chờ trong giây lát
                    </p>
                  )}
                </div>
                {/* <div>
                  <p className="mt-3">
                    Quý khách muốn nhận OTP theo hình thức khác ?
                  </p>
                  <button
                    className="text-blue-500"
                    onClick={changeOptionHandler}
                  >
                    Đổi hình thức
                  </button>

                  {err && <p className="text-red-500">{err}</p>}
                </div> */}
              </div>
            )}
            {/* change option OTP */}
            {changeOption && (
              <OptionOTP
                value={selectedOption}
                action={handleSelectedOption}
                active={isActive}
                sms={props.order.customer_contact}
                email={me?.email}
              />
            )}

            <div className="flex items-center gap-16">
              <Button variant="solidDanger" onClick={offTable}>
                {t('text-cancel')}
              </Button>
              <Button
                className=" "
                onClick={confirmHandler}
                isLoading={isLoading}
              >
                {`${changeOption ? 'Thay đổi' : t('text-submit-confirm')} `}
              </Button>
            </div>
          </div>
        )}
        {thank && <div onClick={offTable}>{<ThankYou />}</div>}
      </div>
    </>
  );
};
export default OTPpopup;
