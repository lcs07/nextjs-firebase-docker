import React from 'react';
import Head from 'next/head';
import {appWithTranslation} from 'next-i18next';
import {useTranslation} from 'next-i18next';

function MyApp({Component, pageProps}) {
  // console.log('==== _app START');

  const {t} = useTranslation('common');

  return (
    <>
      <Head>
        {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /> */}
        <meta name="viewport" content="width=device-width" />
        <title>{t('title')}</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);
