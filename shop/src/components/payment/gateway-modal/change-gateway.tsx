import { UpdateIcon } from '@/components/icons/update-icon';
import { useModalAction } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import { Order } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props {
  order: Order;
  buttonSize?: 'big' | 'medium' | 'small';
}

const ChangeGateway: React.FC<Props> = ({ order }) => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalAction();

  const handleChangePaymentGateway = async () => {
    openModal('GATEWAY_MODAL', {
      order,
    });
  };

  return (
    <Button
      className="w-full rounded-full bg-transparent border-2 border-gray-300 hover:bg-transparent hover:border-4 active:bg-transparent "
      onClick={handleChangePaymentGateway}
    >
      <UpdateIcon className="h-[18px] w-[18px]" />
      <span className="text-gray-500 dark:text-white">Đổi phương thức TT</span>
    </Button>
  );
};

export default ChangeGateway;
