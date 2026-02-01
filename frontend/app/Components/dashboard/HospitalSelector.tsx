"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface Hospital {
  id: string;
  name: string;
  location?: string;
  status?: "critical" | "busy" | "normal";
}

interface HospitalSelectorProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  placeholder?: string;
  className?: string;
}

export function HospitalSelector({
  hospitals,
  selectedHospital,
  onSelectHospital,
  placeholder = "Select Facility",
  className,
}: HospitalSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mounted, setMounted] = React.useState(false);

    // Prevent SSR rendering to avoid hydration mismatch with Radix UI IDs
    React.useEffect(() => {
        setMounted(true);
    }, []);

  const filteredHospitals = React.useMemo(() => {
    if (!searchQuery) return hospitals;

    const query = searchQuery.toLowerCase();
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.location?.toLowerCase().includes(query),
    );
  }, [hospitals, searchQuery]);

    const handleSelect = (hospital: Hospital) => {
        onSelectHospital(hospital);
        setOpen(false);
        setSearchQuery("");
    };

    // Render placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
        return (
            <Button
                variant="outline"
                className={cn(
                    "w-full justify-between bg-background hover:bg-accent transition-colors",
                    className,
                )}
            >
                <span className="truncate">
                    {selectedHospital ? selectedHospital.name : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        );
    }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select hospital"
          className={cn(
            "w-full justify-between bg-background hover:bg-accent transition-colors",
            className,
          )}
        >
          <span className="truncate">
            {selectedHospital ? selectedHospital.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex items-center border-b border-neutral-border px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-0"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto p-1">
          {filteredHospitals.length === 0 ? (
            <div className="py-6 text-center text-sm text-neutral-text-muted">
              No hospitals found
            </div>
          ) : (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-neutral-text-muted uppercase tracking-wider">
                Hospitals
              </div>
              {filteredHospitals.map((hospital) => (
                <button
                  key={hospital.id}
                  onClick={() => handleSelect(hospital)}
                  className={cn(
                    "relative flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    selectedHospital?.id === hospital.id && "bg-accent",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-brand-primary",
                      selectedHospital?.id === hospital.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{hospital.name}</div>
                    {hospital.location && (
                      <div className="text-xs text-neutral-text-muted">
                        {hospital.location}
                      </div>
                    )}
                  </div>
                  {hospital.status && (
                    <div
                      className={cn(
                        "ml-2 h-2 w-2 rounded-full",
                        hospital.status === "critical" &&
                          "bg-severity-critical animate-pulse",
                        hospital.status === "busy" && "bg-severity-urgent",
                        hospital.status === "normal" && "bg-severity-stable",
                      )}
                    />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-brand-primary hover:text-brand-primary hover:bg-alert-bg-sky text-sm"
            onClick={() => {
              setOpen(false);
              // Could trigger "View all hospitals" action
            }}
          >
            View all hospitals
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
