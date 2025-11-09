import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact YCQ Sonate - Enterprise AI Trust Infrastructure',
  description: 'Get in touch with YCQ Sonate for enterprise AI trust infrastructure solutions. Schedule a consultation or request a demo.',
  openGraph: {
    title: 'Contact YCQ Sonate - Enterprise AI Trust Infrastructure',
    description: 'Get in touch with YCQ Sonate for enterprise AI trust infrastructure solutions.',
  },
}

export default function ContactPage() {
  return <ContactClient />
}