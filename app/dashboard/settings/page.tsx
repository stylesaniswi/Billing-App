"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Config {
  key: string;
  value: string;
  type: string;
  description: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) throw new Error("Failed to fetch configurations");
        const data = await response.json();
        setConfigs(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load configurations",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchConfigs();
    }
  }, [session, toast]);

  const handleUpdateConfig = async (key: string, value: string, type: string) => {
    try {
      const response = await fetch(`/api/config/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value, type }),
      });

      if (!response.ok) throw new Error("Failed to update configuration");

      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });

      // Update local state
      setConfigs(configs.map(config => 
        config.key === key ? { ...config, value } : config
      ));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update configuration",
      });
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return <div>You don't have permission to view this page.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        {configs.map((config) => (
          <Card key={config.key}>
            <CardHeader>
              <CardTitle>{config.key}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={config.key}>Value</Label>
                {config.type === "BOOLEAN" ? (
                  <Select
                    value={config.value}
                    onValueChange={(value) => handleUpdateConfig(config.key, value, config.type)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id={config.key}
                      value={config.value}
                      onChange={(e) => {
                        const newConfigs = [...configs];
                        const index = newConfigs.findIndex(c => c.key === config.key);
                        newConfigs[index] = { ...config, value: e.target.value };
                        setConfigs(newConfigs);
                      }}
                      type={config.type === "NUMBER" ? "number" : "text"}
                    />
                    <Button
                      onClick={() => handleUpdateConfig(config.key, config.value, config.type)}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}