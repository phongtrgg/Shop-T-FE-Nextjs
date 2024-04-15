import Image from '@/components/ui/image';
export const TomxuIcon = ({ ...props }) => {
  return (
    <div className="flex items-center">
      <Image
        src="/icons/logo.png"
        // fill
        loading="eager"
        alt="tomxu-img"
        className="object-contain"
        priority
        // sizes="(max-width: 768px) 100vw,
        //     (max-width: 1200px) 50vw,
        //     33vw"
        width={`${35}`}
        height={`${35}`}
      ></Image>
      <span className="text-2xl font-bold ">TOMXU</span>
    </div>
  );
};
