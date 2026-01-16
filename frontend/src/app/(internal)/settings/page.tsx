import React from "react";
import Settings from "@/components/Settings";
import { fetchFromServer } from "@/lib/server-api";

export default async function SettingsPage() {
    let initialSettings = null;
    try {
        const user = await fetchFromServer("/auth/me");
        if (user && user.id) {
           initialSettings = await fetchFromServer(`/api/settings`);
        }
    } catch (e) {
        console.error("Failed to fetch settings server-side", e);
    }

    return (
        <main className="p-8 space-y-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <Settings initialSettings={initialSettings} />
        </main>
    );
}
