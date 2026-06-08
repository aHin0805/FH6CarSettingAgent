"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">方案对比</h2>
        <p className="text-muted-foreground mt-1">选择两个调校方案进行参数对比</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">暂无可对比的方案</p>
          <p className="text-sm text-muted-foreground mt-1">
            需要至少两个调校方案才能进行对比
          </p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/chat")}>
            去生成调校方案
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
