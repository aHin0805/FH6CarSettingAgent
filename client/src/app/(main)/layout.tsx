"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/chat", label: "AI 调校", icon: "💬" },
  { href: "/garage", label: "车库", icon: "🚗" },
  { href: "/tunes", label: "调校记录", icon: "📋" },
  { href: "/compare", label: "方案对比", icon: "⚖️" },
  { href: "/settings", label: "设置", icon: "⚙️" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-56 border-r bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <span className="text-2xl">🏎️</span>
          <div>
            <h1 className="text-sm font-bold">FH6 调校师</h1>
            <p className="text-[10px] text-muted-foreground">地平线6调校助手</p>
          </div>
        </div>

        <Separator />

        {/* 导航 */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 text-sm",
                    isActive && "font-medium"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* 底部信息 */}
        <div className="p-3 text-[10px] text-muted-foreground">
          <p>Forza Horizon 6</p>
          <p>车辆调校辅助工具 v1.0</p>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
