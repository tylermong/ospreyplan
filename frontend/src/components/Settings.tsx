"use client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const START_YEAR = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

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
              <Select>
                <SelectTrigger className="w-full max-w-sm border-foreground/10">
                  <SelectValue placeholder="Select your degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Degrees</SelectLabel>
                    <SelectItem value="computer-science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="computer-information-systems">
                      Computer Information Systems
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
              <Select>
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
        </CardContent>

        <CardFooter>
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save changes</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
