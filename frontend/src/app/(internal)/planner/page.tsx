import React from "react";
import Planner from "@/components/Planner";
import { fetchFromServer } from "@/lib/server-api";
import { BackendSemester } from "@/types/planner.types";

export default async function PlannerPage() {
    let initialSemesters: BackendSemester[] | null = null;
    let userId: string | null = null;
    
    try {
        const user = await fetchFromServer("/auth/me");
        if (user && user.id) {
            userId = user.id;
            initialSemesters = await fetchFromServer(`/api/semesters/user/${user.id}`);
        }
    } catch(e) {
        console.error("Server fetch failed in PlannerPage", e);
    }

    return (
        <main className="p-8 space-y-6">
            <h1 className="text-2xl font-semibold">Planner</h1>
            <Planner initialSemesters={initialSemesters || []} initialUserId={userId} />
        </main>
    );
}
