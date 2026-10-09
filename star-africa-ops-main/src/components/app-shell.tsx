import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Archive,
  ArrowUpRight,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useRecords } from "@/data/hooks";
import { modules } from "@/data/modules";
import type { BusinessRecord, ModuleId } from "@/data/types";
import { RecordEditor } from "./record-editor";
import { cn } from "@/lib/utils";
const navigation = [
  { label: "Overview", to: "/", icon: LayoutDashboard, group: "WORKSPACE" },
  { label: "Bids & Tenders", to: "/tenders", icon: ClipboardList, group: "WORKSPACE" },
  { label: "Projects", to: "/projects", icon: Building2, group: "WORKSPACE" },
  { label: "Documents", to: "/documents", icon: FileText, group: "WORKSPACE" },
  { label: "Finance", to: "/finance", icon: CircleDollarSign, group: "OPERATIONS" },
  { label: "Invoices", to: "/invoices/new", icon: ReceiptText, group: "OPERATIONS" },
  { label: "Procurement", to: "/procurement", icon: PackageSearch, group: "OPERATIONS" },
  { label: "Suppliers", to: "/suppliers", icon: Truck, group: "OPERATIONS" },
  { label: "Inventory", to: "/inventory", icon: Boxes, group: "OPERATIONS" },
  { label: "Payroll & HR", to: "/payroll-hr", icon: BriefcaseBusiness, group: "ORGANIZATION" },
  { label: "Customers", to: "/customers", icon: Users, group: "ORGANIZATION" },
  { label: "Reports", to: "/reports", icon: Archive, group: "ORGANIZATION" },
  { label: "Admin", to: "/admin", icon: Settings, group: "ORGANIZATION" },
];
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const [create, setCreate] = useState<ModuleId | null>(null);
  const [selected, setSelected] = useState<BusinessRecord | null>(null);
  const query = useRecords();
  const alerts = (query.data ?? []).filter((row) =>
    ["At risk", "Delayed", "Low stock", "Pending"].includes(row.status),
  );
  const title =
    pathname === "/"
      ? "Business overview"
      : pathname === "/documents/ocr-review"
        ? "Receipt review"
        : pathname === "/invoices/new"
          ? "Invoices"
          : (navigation.find((item) => item.to === pathname)?.label ?? "Workspace");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  const go = (to: string) => {
    setMobileOpen(false);
    setSearchOpen(false);
    setNotifications(false);
    void navigate({ to });
  };
  const navContent = (compact: boolean) => (
    <>
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
        <div className={cn("rounded-lg bg-white p-1.5", compact ? "w-10" : "w-full")}>
          <img
            src="/brand/star-africa.png"
            alt="Star Africa Logistics"
            className={cn("w-full object-contain", compact ? "h-8" : "h-12")}
          />
        </div>
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {["WORKSPACE", "OPERATIONS", "ORGANIZATION"].map((group) => (
          <div key={group} className="mb-5">
            {!compact && (
              <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.16em] text-sidebar-muted/60">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {navigation
                .filter((item) => item.group === group)
                .map((item) => (
                  <button
                    key={item.to}
                    title={item.label}
                    aria-current={pathname === item.to ? "page" : undefined}
                    onClick={() => go(item.to)}
                    className={cn(
                      "group flex h-[38px] w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-medium transition-colors",
                      pathname === item.to
                        ? "bg-sidebar-accent text-white shadow-sm"
                        : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
                      compact && "justify-center px-0",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-[17px] shrink-0",
                        pathname === item.to && "text-sidebar-primary",
                      )}
                    />
                    {!compact && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {pathname === item.to && (
                          <span className="size-1.5 rounded-full bg-sidebar-primary" />
                        )}
                      </>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </nav>
      {!compact && (
        <div className="mx-4 mb-4 rounded-xl border border-sidebar-border bg-sidebar-hover p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="size-4 text-sidebar-primary" />
            Star Africa Limited
          </div>
          <p className="mt-1.5 text-[10px] text-sidebar-muted">Kampala, Uganda · UGX</p>
        </div>
      )}
      <div className="flex items-center gap-3 border-t border-sidebar-border p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-[10px] font-semibold">
          AM
        </span>
        {!compact && (
          <div>
            <p className="text-xs font-medium">Amina Mugisha</p>
            <p className="mt-0.5 text-[10px] text-sidebar-muted">Administrator</p>
          </div>
        )}
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-card focus:p-3"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-sidebar text-sidebar-foreground lg:flex",
          collapsed ? "w-20" : "w-[232px]",
        )}
      >
        {navContent(collapsed)}
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-[270px] flex-col gap-0 border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigate Star Africa workspaces</SheetDescription>
          {navContent(false)}
        </SheetContent>
      </Sheet>
      <div className={cn("min-w-0 transition-[margin]", collapsed ? "lg:ml-20" : "lg:ml-[232px]")}>
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-8">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="hidden lg:inline-flex"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span>Workspace</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground"
              onClick={() => setSearchOpen(true)}
              aria-label="Search workspace"
            >
              <Search className="size-4" />
              <span className="hidden text-xs xl:inline">Search anything…</span>
              <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] xl:inline">
                Ctrl K
              </kbd>
            </Button>
            <div className="mx-1 hidden h-5 border-l sm:block" />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Toggle dark mode"
              onClick={() => setDark((v) => !v)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Notifications"
              className="relative"
              onClick={() => setNotifications(true)}
            >
              <Bell />
              {alerts.some((row) => !read.includes(row.id)) && (
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent-strong ring-2 ring-card" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" aria-label="Account menu" className="gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    AM
                  </span>
                  <ChevronDown className="hidden size-3 sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Amina Mugisha
                  <small className="mt-1 block font-normal text-muted-foreground">
                    Administrator · Star Africa
                  </small>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => go("/admin")}>Company policies</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDark((v) => !v)}>
                  {dark ? "Light" : "Dark"} appearance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main-content" className="min-w-0 px-4 py-7 md:px-8 lg:py-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="no-print mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">
                  STAR AFRICA / {pathname === "/" ? "COMMAND CENTER" : "WORKSPACE"}
                </p>
                <h1 className="text-[26px] font-semibold tracking-[-0.035em] md:text-[30px]">
                  {title}
                </h1>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shadow-sm">
                    <Plus className="size-4" />
                    Create new
                    <ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Start something new</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreate("projects")}>
                    <Building2 className="mr-2 size-4" />
                    Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreate("tenders")}>
                    <ClipboardList className="mr-2 size-4" />
                    Tender
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/invoices/new")}>
                    <ReceiptText className="mr-2 size-4" />
                    Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreate("procurement")}>
                    <PackageSearch className="mr-2 size-4" />
                    Purchase request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {children}
            <footer className="no-print mt-10 flex flex-wrap justify-between gap-2 border-t pt-4 text-[10px] text-muted-foreground">
              <span>© 2026 Star Africa Limited</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3" />
                Demo workspace · Changes last for this session
              </span>
            </footer>
          </div>
        </main>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-h-[80dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search your workspace</DialogTitle>
            <DialogDescription>
              Find a module, project, tender or business record.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            aria-label="Search records"
            placeholder="Type a name or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-1">
            {navigation
              .filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
              .slice(0, 5)
              .map((item) => (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm hover:bg-muted"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            {search &&
              (query.data ?? [])
                .filter((row) =>
                  `${row.title} ${row.id} ${row.owner}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .slice(0, 8)
                .map((row) => (
                  <button
                    key={row.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setSelected(row);
                    }}
                    className="block w-full rounded-lg p-3 text-left hover:bg-muted"
                  >
                    <span className="text-sm font-medium">{row.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {modules[row.module].title} · {row.id}
                    </span>
                  </button>
                ))}
            {search &&
              !navigation.some((item) => item.label.toLowerCase().includes(search.toLowerCase())) &&
              !(query.data ?? []).some((row) =>
                `${row.title} ${row.id} ${row.owner}`.toLowerCase().includes(search.toLowerCase()),
              ) && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results for “{search}”.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>
      <Sheet open={notifications} onOpenChange={setNotifications}>
        <SheetContent className="overflow-y-auto">
          <SheetTitle>Activity & attention</SheetTitle>
          <SheetDescription className="mt-2">
            Items that need a closer look across your workspace.
          </SheetDescription>
          <Button
            variant="ghost"
            size="sm"
            className="my-4"
            onClick={() => setRead(alerts.map((row) => row.id))}
          >
            Mark all as read
          </Button>
          <div className="space-y-3">
            {alerts.map((row) => (
              <button
                key={row.id}
                className={cn(
                  "w-full rounded-xl border p-4 text-left",
                  !read.includes(row.id) && "bg-primary/5",
                )}
                onClick={() => {
                  setRead((old) => [...old, row.id]);
                  setNotifications(false);
                  setSelected(row);
                }}
              >
                <p className="text-xs font-semibold text-accent-strong">{row.status}</p>
                <p className="mt-2 text-sm font-semibold">{row.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {modules[row.module].title} · {row.owner}
                </p>
              </button>
            ))}
            {!alerts.length && (
              <p className="py-8 text-sm text-muted-foreground">You’re all caught up.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {create && <RecordEditor module={create} onClose={() => setCreate(null)} />}
      {selected && (
        <RecordEditor
          module={selected.module}
          record={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
