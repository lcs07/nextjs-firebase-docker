import React from 'react';
import Head from 'next/head';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useTranslation} from 'next-i18next';
import App from '../components/App';

export default function About() {
  const {t} = useTranslation('common');

  return (
    <>
      <Head>
        <title>{`${t('about')} | ${t('title')}`}</title>
      </Head>
      <App>
        <p>{t('to-second-page')}</p>
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
