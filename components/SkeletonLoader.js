import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton height={100} borderRadius={12} count={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2">
                    <Skeleton height={400} borderRadius={12} />
                </div>
                <div>
                    <Skeleton height={400} borderRadius={12} />
                </div>
            </div>
        </div>
    );
}

export function ResultsSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton height={60} width={300} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton height={300} borderRadius={12} />
                <Skeleton height={300} borderRadius={12} />
                <Skeleton height={300} borderRadius={12} />
            </div>
            <Skeleton count={5} height={80} className="mb-4" />
        </div>
    );
}
