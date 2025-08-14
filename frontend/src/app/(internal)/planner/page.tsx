import React from "react";
import Planner from "@/components/Planner";

export default function PlannerPage() {
    return (
        <main className="p-8 space-y-6">
            <h1 className="text-2xl font-semibold">Planner</h1>
            <Planner />
        </main>
    );
}