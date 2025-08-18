import React from "react";
import Settings from "@/components/Settings";

export default function SettingsPage() {
    return (
        <main className="p-8 space-y-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <Settings />
        </main>
    );
}