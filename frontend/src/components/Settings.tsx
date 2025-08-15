"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";

export default function Settings() {
  const START_YEAR = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

  const [degree, setDegree] = useState<string | null>(null);
  const [startYear, setStartYear] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const apiBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://ospreyplan.app"
        : "http://localhost:8080";

    try {
      const response = await fetch(`${apiBaseUrl}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ degree, startYear }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || "Failed to save settings");
      }
      else {
        // TODO: Success toast
      }
    }
    catch (error) {
      setError("Error saving settings");
    }
    finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-1/4">
      <Card>
        <CardContent>
          <form className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className="text-md font-bold">Degree</label>
              <span className="text-xs text-muted-foreground">
                Choose the degree program you are enrolled in.
              </span>
              <Select onValueChange={(selectedDegree) => setDegree(selectedDegree)}>
                <SelectTrigger className="w-full max-w-sm border-foreground/10">
                  <SelectValue placeholder="Select your degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Degrees</SelectLabel>
                    <SelectItem value="bs-computer-science">
                      B.S. in Computer Science
                    </SelectItem>
                    <SelectItem value="bs-computer-information-systems">
                      B.S. in Computer Information Systems
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-md font-bold">Start Year</label>
              <span className="text-xs text-muted-foreground">
                Choose the year you began your program.
              </span>
              <Select onValueChange={(selectedYear) => setStartYear(selectedYear)}>
                <SelectTrigger className="w-full max-w-sm border-foreground/10">
                  <SelectValue placeholder="Select your start year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Start Year</SelectLabel>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>

        <CardFooter>
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
