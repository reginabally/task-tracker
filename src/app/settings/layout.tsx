import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Task Tracker',
  description: 'Configure your Task Tracker settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 