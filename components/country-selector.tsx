"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  value: string; // The selected country code, e.g. "972"
  onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === value) || COUNTRIES.find(c => c.cca2 === "IL") || COUNTRIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filteredCountries = COUNTRIES.filter((country) => {
    const term = search.toLowerCase();
    return (
      country.name.toLowerCase().includes(term) ||
      country.code.includes(term.replace("+", ""))
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-[140px] h-10 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-zinc-900"
      >
        <span className="flex items-center gap-2 truncate">
          <span>{selectedCountry.flag}</span>
          <span className="truncate">+{selectedCountry.code}</span>
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 w-[250px] mt-1 bg-white border border-zinc-200 rounded-md shadow-lg top-full left-0 max-h-[300px] flex flex-col">
          <div className="flex items-center px-3 py-2 border-b border-zinc-100">
            <Search className="w-4 h-4 mr-2 opacity-50" />
            <input
              ref={searchInputRef}
              type="text"
              className="flex-1 text-xs bg-transparent focus:outline-none text-zinc-900"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-xs text-center text-zinc-500">No results found.</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.cca2}
                  type="button"
                  className={cn(
                    "flex items-center w-full px-2 py-2 text-xs rounded-sm hover:bg-zinc-100 transition-colors text-left text-zinc-800",
                    value === country.code ? "bg-emerald-50/50 text-emerald-900 font-medium" : ""
                  )}
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="mr-2">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="ml-2 text-zinc-500">+{country.code}</span>
                  {value === country.code && <Check className="w-3.5 h-3.5 ml-2 text-emerald-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
