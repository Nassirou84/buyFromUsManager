import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';

export default function HomePage() {
  redirect(paths.dashbord.root);
}
