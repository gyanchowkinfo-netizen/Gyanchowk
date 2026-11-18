import type { Metadata } from 'next';
import { HelpCentreClient } from '@/components/help/HelpCentreClient';

export const metadata: Metadata = {
  title: 'Help centre | Gyan Chowk',
  description: 'Recorded learning support, video playback, payments, tests, doubts and verifiable certificates for Gyan Chowk students.',
};

export default function HelpPage() {
  return <HelpCentreClient />;
}
