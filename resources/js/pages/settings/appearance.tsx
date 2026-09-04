import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import FullPageHeader from '@/components/full-page-header';
import HeadingSmall from '@/components/heading-small';

import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <div className="bg-background min-h-screen">
            <Head title="Appearance settings" />

            <FullPageHeader />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </div>
    );
}
