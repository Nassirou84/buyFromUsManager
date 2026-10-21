"use client";

import React, { useCallback } from "react";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Iconify from "@/components/iconify";
import { useBoolean } from "@/hooks/use-boolean";
import { Popover } from "@radix-ui/react-popover";
import { useLocales } from "@/locales";
import { Button } from "@/components/ui/button";

function LanguagePoppever() {
  const locales = useLocales();
  const open = useBoolean();

  const handleChangeLang = useCallback(
    (newLang: string) => {
      locales.onChangeLang(newLang);
      open.onFalse();
    },
    [locales, open]
  );

  return (
    <div>
      <Popover open={open.value} onOpenChange={open.setValue}>
        <PopoverTrigger asChild>
          <Button variant="ghost" onClick={open.onTrue} size="sm">
            <Iconify icon={locales.currentLang.icon} className="w-4 h-4" />
            <span className="text-sm">
              {locales.currentLang.label.substring(0, 2)}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-16 p-1 space-y-1">
          {locales.allLangs.map((lang) => (
            <Button
              key={lang.value}
              onClick={() => handleChangeLang(lang.value)}
              className="w-full"
              variant="ghost"
              size="sm"
            >
              <Iconify icon={lang.icon} className="w-4 h-4" />
              <span className="text-sm">{lang.label.substring(0, 2)}</span>
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default LanguagePoppever;
