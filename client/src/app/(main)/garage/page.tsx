"use client";

import { useVehicleStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function GaragePage() {
  const { vehicles } = useVehicleStore();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">车库</h2>
          <p className="text-muted-foreground mt-1">管理你的车辆信息</p>
        </div>
        <Badge variant="outline">{vehicles.length} 辆车</Badge>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">车库暂无车辆</p>
            <p className="text-sm text-muted-foreground mt-1">
              在 AI 对话中添加车辆后，车辆信息将在此展示
            </p>
            <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/chat")}>
              开始对话添加车辆
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                  <Badge variant="secondary">{vehicle.carClass}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {vehicle.year} · {vehicle.drivetrain} · PI {vehicle.piScore}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
