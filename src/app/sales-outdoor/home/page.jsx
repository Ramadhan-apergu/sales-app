'use client';

import ProfilBar from "@/components/salesOutdoor/dashboard/ProfileBar";
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import Layout from "@/components/salesOutdoor/Layout";
import ProfilFetch from "@/modules/salesApi/getProfile";
import { use, useEffect, useState } from 'react';

export default function Dashboard() {
    const [profile, setProfile] = useState({});

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profileData = await ProfilFetch.get();
                setProfile(profileData);

                console.log('Profile data:', profileData);
            } catch (e) {
                console.error('Error fetching profile', e);
            }
        }

        fetchProfile();
    }, []);

    return (
        <Layout>
            <FixedHeaderBar/>
            <div className="flex flex-col gap-4 bg-gray-3 pb-4 pt-11">
                <ProfilBar data={{
                    name: profile.data?.name || '',
                    role: profile.data?.role_name || '',
                    url: profile.data?.url || '',
                }} />
                <div className="w-full flex flex-col gap-4 px-4">
                    <div className="w-full h-24 bg-blue-6 rounded-xl" />
                    <div className="w-full h-64 bg-white rounded-xl" />
                    <div className="w-full h-56 bg-white rounded-xl" />
                </div>
            </div>
        </Layout>
    );
}
