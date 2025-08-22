"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supportedLanguages } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { resetDatabaseAndSeed } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLanguage(i18n.language || "en");
  }, [i18n.language]);

  const handleLanguageChange = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleResetDatabase = async () => {
    if (!confirm("Are you sure you want to reset the database? This will delete all your data and replace it with demo data. This action cannot be undone.")) {
      return;
    }

    setIsResetting(true);
    try {
      await resetDatabaseAndSeed();
      toast({
        title: "Database Reset Successful",
        description: "Your database has been reset and seeded with fresh demo data.",
      });
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Database reset failed:", error);
      toast({
        title: "Database Reset Failed",
        description: "An error occurred while resetting the database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Customize your Finance AI experience and manage your preferences.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Language, currency and appearance preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="grid gap-2 max-w-sm">
            <Label>Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lng) => (
                  <SelectItem key={lng.code} value={lng.code}>{lng.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency (read-only) */}
          <div className="grid gap-2 max-w-sm">
            <Label>Currency</Label>
            <div className="h-10 inline-flex items-center rounded-md border px-3 text-sm text-muted-foreground bg-muted/50">
              INR (₹)
            </div>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between max-w-sm">
            <div className="grid gap-1">
              <Label>Theme</Label>
              <span className="text-sm text-muted-foreground">Toggle dark mode</span>
            </div>
            {mounted && (
              <Switch 
                checked={resolvedTheme === "dark"} 
                onCheckedChange={handleThemeChange} 
              />
            )}
          </div>

          <div>
            <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>Reset database and manage data. Use with caution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2 max-w-sm">
            <Label>Reset Database</Label>
            <p className="text-sm text-muted-foreground">
              This will delete all your current data and replace it with fresh demo data. 
              Useful for clearing migration errors or starting fresh.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="w-fit"
            >
              {isResetting ? "Resetting..." : "Reset Database & Seed Demo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
