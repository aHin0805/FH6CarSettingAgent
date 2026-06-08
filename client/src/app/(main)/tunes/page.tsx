"use client";

import { useTuneStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TunesPage() {
  const { tunes } = useTuneStore();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">调校记录</h2>
          <p className="text-muted-foreground mt-1">管理你的所有调校方案</p>
        </div>
        <Badge variant="outline">{tunes.length} 条记录</Badge>
      </div>

      {tunes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">暂无调校记录</p>
            <p className="text-sm text-muted-foreground mt-1">
              在 AI 对话中生成调校方案后，可在此查看和管理
            </p>
            <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/chat")}>
              开始调校
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tunes.map((tune) => (
            <Card key={tune.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  {tune.name}
                  <Badge variant="secondary">{tune.usageType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{tune.description}</p>
                <div className="flex gap-1 mt-2">
                  {tune.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
