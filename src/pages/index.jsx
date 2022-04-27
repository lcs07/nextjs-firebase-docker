import App from '../components/App'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Home() {

    const router = useRouter()
    const { t } = useTranslation('common')

  return (
    <App>
      <p>{t('h1')}</p>
      <div>
          <Link
            href='/'
            locale={router.locale === 'ko' ? 'en' : 'ko'}
          >
            <button>
              {t('change-locale')}
            </button>
          </Link>
        </div>
    </App>
  )
}

export async function getServerSideProps(context) {
    return {
      props: {
        ...await serverSideTranslations(context.locale, ['common']),
      }, // will be passed to the page component as props
    }
}