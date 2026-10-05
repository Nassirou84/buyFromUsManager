import Link from 'next/link';
import { paths } from '@/lib/paths';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-sm text-neutral-first">This page could not be found.</p>
      <Link
        href={paths.dashbord.root}
        className="text-sm font-bold text-primary-first hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
