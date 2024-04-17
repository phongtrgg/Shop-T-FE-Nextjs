import { useMe } from '@/data/user';
import { useEffect, useState } from 'react';
import useCryptData from '@/lib/hooks/use-crypt-data';
import { useMutation } from 'react-query';
import client from '@/data/client';
function useUserTomxu() {
  const { encryptData, data: aesData, key, iv } = useCryptData();
  const { me } = useMe();
  const [userTomxu, setUserTomxu] = useState(0);
  let enData: any;
  useEffect(() => {
    if (me?.id && me?.email) {
      enData = '458875' + me?.id + me.email;
    }
    if (me?.id && me?.email && aesData) {
      getUserTomxu();
    }
  }, [me, aesData]);
  useEffect(() => {
    if (enData) {
      encryptData(enData, key, iv);
    }
  }, [enData]);

  const { mutate: getTomxu } = useMutation(client.userTomxu.getTomxu, {
    onSuccess: (res: any) => {
      setUserTomxu(res?.data.balance);
    },
    onError: (error: any) => {},
  });
  function getUserTomxu() {
    getTomxu({
      customer_id: me?.id,
      type: 1,
      secret_token: aesData,
      email: me?.email,
    });
  }
  return { userTomxu };
}
export default useUserTomxu;
