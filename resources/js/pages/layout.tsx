import { Link } from '@inertiajs/react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <nav>
                <Link href="/">Home</Link>
                <Link href="/products">Products</Link>
            </nav>
            <main>{children}</main>
        </div>
    );
}
