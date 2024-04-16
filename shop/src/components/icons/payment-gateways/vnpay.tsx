import Image from '@/components/ui/image';
export const VnpayIcon = ({ ...props }) => {
  return (
    <div className="flex items-center">
      <Image
        src="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"
        loading="eager"
        alt="cash-img"
        className="object-contain bg-transparent"
        priority
        width={`${100}`}
        height={`${100}`}
      />
    </div>
  );
};
