import React from 'react';
import Document, {Html, Head, Main, NextScript} from 'next/document';

export default class RootDocument extends Document {
  render() {
    // console.log('==== _document START');

    return (
      <Html lang="ko">
        <Head>
          <meta charSet="utf-8" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
