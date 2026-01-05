import { auth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect('/auth/signin');

    return (
        <div className="flex min-h-screen bg-background text-foreground bg-transparent">
            {/* Sidebar is handled by layout */}
            <div className="flex-1 p-8 h-full">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your account preferences and subscription.</p>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input defaultValue={session.user.name || ''} disabled className="bg-muted/50" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input defaultValue={session.user.email || ''} disabled className="bg-muted/50" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Section Removed */}

                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive" disabled>Delete Account</Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This action is currently disabled for safety.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
