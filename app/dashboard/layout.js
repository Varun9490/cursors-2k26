export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <aside className="hidden md:block z-50">
                {/* Imported dynamically to avoid hydration mismatch if using window resize for collapse? 
             Actually Sidebar is client component, so it's fine. */}
                {/* We need to import Sidebar here */}
                <SidebarWrapper />
            </aside>

            <main className="flex-1 overflow-y-auto relative scroll-smooth focus:scroll-auto flex flex-col">
                <MobileNav />
                {children}
            </main>
        </div>
    );
}

import SidebarWrapper from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
