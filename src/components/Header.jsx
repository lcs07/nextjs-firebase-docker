import React from 'react';
import {useTranslation} from 'next-i18next';
import Link from 'next/link';

const Header = ({pathname}) => {
  const {t} = useTranslation('common');

  return (
    <header>
      <Link href='/'>
        <a className={pathname === '/' ? 'is-active' : ''}>{t('home')}</a>
      </Link>
      {' '}
      <Link href='/about'>
        <a className={pathname === '/about' ? 'is-active' : ''}>{t('about')}</a>
      </Link>
    </header>
  );
};

export default Header;
