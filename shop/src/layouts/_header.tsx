import CartButton from '@/components/cart/cart-button';
import GridSwitcher from '@/components/product/grid-switcher';
import SearchButton from '@/components/search/search-button';
import Alert from '@/components/ui/alert';
import CountdownTimer from '@/components/ui/countdown-timer';
import Hamburger from '@/components/ui/hamburger';
import LanguageSwitcher from '@/components/ui/language-switcher';
import LoginMenu from '@/components/ui/login-button';
import Logo from '@/components/ui/logo';
import ThemeSwitcher from '@/components/ui/theme-switcher';
import routes from '@/config/routes';
import { useSettings } from '@/data/settings';
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsScrollingStart,
  isMultiLangEnable,
} from '@/lib/constants';
import { useSwapBodyClassOnScrollDirection } from '@/lib/hooks/use-swap-body-class';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useWindowSize } from 'react-use';

interface HeaderProps {
  isCollapse?: boolean;
  showHamburger?: boolean;
  onClickHamburger?: () => void;
}

export default function Header({
  isCollapse,
  showHamburger = false,
  onClickHamburger,
}: HeaderProps) {
  const { asPath } = useRouter();
  const { t } = useTranslation('common');
  const { width } = useWindowSize();
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  const { settings } = useSettings();
  useSwapBodyClassOnScrollDirection();
  const [isScrolling] = useAtom(checkIsScrollingStart);
  const router = useRouter();
  return (
    <>
      {width >= RESPONSIVE_WIDTH && underMaintenanceIsComing && !isScrolling ? (
        <Alert
          message={t('text-maintenance-mode-title')}
          variant="info"
          className="sticky top-0 left-0 z-50 rounded-none"
          childClassName="flex justify-center items-center w-full gap-4"
        >
          <CountdownTimer
            date={new Date(settings?.maintenance?.start as string)}
            className="text-blue-600 [&>p]:bg-blue-200 [&>p]:p-2 [&>p]:text-xs [&>p]:text-blue-600"
          />
        </Alert>
      ) : (
        ''
      )}
      <header className="app-header sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-light-300 bg-light py-1 px-4 ltr:left-0 rtl:right-0 dark:border-dark-300 dark:bg-dark-250 sm:h-[70px] sm:px-6">
        <div className="flex items-center gap-3">
          {showHamburger && (
            <Hamburger
              isToggle={isCollapse}
              onClick={onClickHamburger}
              className="hidden sm:flex"
            />
          )}
          <div
            className="flex justify-center"
            onClick={() => {
              router.push('/');
            }}
          >
            <Logo />
            <h1 className="font-bold text-2xl mt-1 cursor-pointer">TOMIRU</h1>
          </div>
        </div>
        <div className="relative flex items-center gap-5 pr-0.5 xs:gap-6 sm:gap-7">
          <a
            // href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/register`}
            href={process.env.NEXT_PUBLIC_APP_TOMIRU_URL}
            target="_blank"
            rel="noreferrer"
            className="focus:ring-accent-700 hidden h-9 shrink-0 items-center justify-center rounded border border-transparent bg-brand px-3 py-0 text-sm font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-brand-dark focus:shadow focus:outline-none focus:ring-1 sm:inline-flex"
          >
            {t('text-become-seller')}
          </a>
          <SearchButton className="hidden sm:flex" />
          <ThemeSwitcher />
          <GridSwitcher />
          {asPath !== routes.checkout && (
            <CartButton className="hidden sm:flex" />
          )}
          {isMultiLangEnable ? (
            <div className="ltr:ml-auto rtl:mr-auto">
              <LanguageSwitcher />
            </div>
          ) : (
            ''
          )}

          <LoginMenu />
        </div>
      </header>
    </>
  );
}
