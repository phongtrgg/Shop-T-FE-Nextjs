import Image from '@/components/ui/image';
export const CashIcon = ({ ...props }) => {
  return (
    <div className="flex items-center">
      <Image
        src="/icons/Cash-removebg-preview.png"
        loading="eager"
        alt="cash-img"
        className="object-contain bg-transparent"
        priority
        width={`${35}`}
        height={`${35}`}
      ></Image>
      <span className="text-2xl font-bold ">COD</span>
    </div>
  );
};
