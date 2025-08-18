"use client";

import { useState, useEffect } from "react";
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
  const [startYear, setStartYear] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const apiBaseUrl =
        process.env.NODE_ENV === "production"
          ? "https://ospreyplan.app"
          : "http://localhost:8080";

      try {
        console.log("Fetching settings...");
        const res = await fetch(`${apiBaseUrl}/api/settings`, {
          method: "GET",
          credentials: "include",
        });

        if (!mounted) return;

        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          setDegree(body.degree ?? null);
          setStartYear(
            body.startYear === undefined || body.startYear === null
              ? null
              : Number(body.startYear)
          );
        }
        else {
          const body = await res.json().catch(() => ({}));
          if (body && body.error) setError(body.error);
        }
      }
      catch (e) {
        setError("Failed to load settings");
      }
    }

    load();

    return () => {
      mounted = false;
      console.log("Settings component unmounted, aborting fetch");
    };
  }, []);

  async function handleSave(updates?: {
    degree?: string | null;
    startYear?: number | null;
  }) {
    setSaving(true);
    setError(null);

    const payloadDegree =
      updates && Object.prototype.hasOwnProperty.call(updates, "degree")
        ? updates.degree
        : degree;
    const payloadStartYear =
      updates && Object.prototype.hasOwnProperty.call(updates, "startYear")
        ? updates.startYear
        : startYear;

    const apiBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://ospreyplan.app"
        : "http://localhost:8080";

    try {
      const response = await fetch(`${apiBaseUrl}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ degree: payloadDegree, startYear: payloadStartYear }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || "Failed to save settings");
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
              <Select
                value={degree ?? undefined}
                onValueChange={(selectedDegree) => {
                  setDegree(selectedDegree);
                  void handleSave({ degree: selectedDegree });
                }}
              >
                <SelectTrigger className="w-full max-w-sm border-foreground/10">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Degree</SelectLabel>
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
              <Select
                value={startYear === null ? undefined : String(startYear)}
                onValueChange={(selectedYear) => {
                  const n = Number(selectedYear);
                  setStartYear(n);
                  void handleSave({ startYear: n });
                }}
              >
                <SelectTrigger className="w-full max-w-sm border-foreground/10">
                  <SelectValue/>
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

  {/* Buttons removed: settings save automatically when changed */}
      </Card>
    </div>
  );
}
