import React from 'react';
import {useRouter} from 'next/router';
import {useTranslation} from 'next-i18next';
import Link from 'next/link';

const Footer = () => {
  const router = useRouter();
  const {t} = useTranslation('common');

  return (
    <footer>
      <Link
        href=''
        locale={router.locale === 'ko' ? 'en' : 'ko'}
      >
        <button>
          {t('change-locale')}
        </button>
      </Link>
    </footer>
  );
};

export default Footer;
