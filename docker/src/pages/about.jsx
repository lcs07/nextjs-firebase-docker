import App from '../components/App'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function About() {
  return (
    <App>
      <p>About Page</p>
    </App>
  )
}

export async function getServerSideProps(context) {
    console.log("context", context)
    return {
      props: {
        ...await serverSideTranslations(context.locale, ['common', 'footer']),
      }, // will be passed to the page component as props
    }
}
