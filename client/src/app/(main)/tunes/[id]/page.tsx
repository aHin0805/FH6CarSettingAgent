"use client";

import { useTuneStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TuneDetailPage() {
  const params = useParams();
  const { getTune } = useTuneStore();
  const tune = getTune(params.id as string);

  if (!tune) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">调校方案不存在</p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/tunes")}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const paramGroups = [
    { title: "轮胎", params: tune.parameters.tires, keys: ["frontPressure", "rearPressure"] },
    { title: "定位", params: tune.parameters.alignment, keys: ["frontCamber", "rearCamber", "frontToe", "rearToe", "caster"] },
    { title: "弹簧", params: tune.parameters.springs, keys: ["frontRate", "rearRate", "frontHeight", "rearHeight"] },
    { title: "阻尼", params: tune.parameters.damping, keys: ["frontRebound", "rearRebound", "frontBump", "rearBump"] },
    { title: "防倾杆", params: tune.parameters.antirollBars, keys: ["front", "rear"] },
    { title: "制动", params: tune.parameters.brakes, keys: ["brakeForce", "brakeBalance"] },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{tune.name}</h2>
          <p className="text-muted-foreground mt-1">{tune.description}</p>
        </div>
        <Badge>{tune.usageType}</Badge>
      </div>

      {paramGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {group.keys.map((key) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-mono">{String((group.params as unknown as Record<string, unknown>)[key])}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
