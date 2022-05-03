import React from 'react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useTranslation} from 'next-i18next';
import App from '../components/App';

export default function Home() {
  const {t} = useTranslation('common');

  return (
    <>
      <App>
        <p>{t('h1')}</p>
      </App>
    </>
  );
}

export async function getServerSideProps(context) {
  // console.log("context", context);
  return {
    props: {
      ...await serverSideTranslations(context.locale ?? 'ko', ['common']),
    }, // will be passed to the page component as props
  };
}
