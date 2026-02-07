import React, { useState } from 'react';
import { LayoutDashboard, Building2, Users, Settings } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CommingSoon from '../../components/ui/CommingSoon';

const UniversityAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'colleges', label: 'Colleges', icon: Building2 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <CommingSoon />;
            case 'colleges':
                return <CommingSoon />;
            case 'users':
                return <CommingSoon />;
            case 'settings':
                return <CommingSoon />;
            default:
                return <CommingSoon />;
        }
    };

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default UniversityAdminDashboard;
