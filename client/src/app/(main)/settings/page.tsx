"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const handleExportData = useCallback(() => {
    const data: Record<string, unknown> = {};
    for (const key of ["fh6_vehicles", "fh6_tunes", "fh6_settings", "fh6_preference"]) {
      const value = localStorage.getItem(key);
      if (value) data[key] = JSON.parse(value);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fh6-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          for (const [key, value] of Object.entries(data)) {
            if (key.startsWith("fh6_")) {
              localStorage.setItem(key, JSON.stringify(value));
            }
          }
          window.location.reload();
        } catch {
          alert("导入失败：无效的 JSON 文件");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">设置</h2>
        <p className="text-muted-foreground mt-1">数据管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📦 数据管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            所有数据存储在浏览器本地（localStorage）。支持导出为 JSON 文件备份，或从 JSON 文件恢复数据。
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportData}>
              📤 导出数据
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              📥 导入数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
