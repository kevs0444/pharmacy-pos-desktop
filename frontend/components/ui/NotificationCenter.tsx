import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type NotificationVariant = "success" | "error" | "warning" | "info";
export type NotificationSource = "frontend" | "backend" | "system";

export interface AppNotification {
  id: string;
  variant: NotificationVariant;
  title: string;
  message?: string;
  source?: NotificationSource;
  createdAt: number;
}

export interface NotificationInput {
  variant: NotificationVariant;
  title: string;
  message?: string;
  source?: NotificationSource;
  durationMs?: number;
}

const VARIANT_CONFIG: Record<
  NotificationVariant,
  {
    icon: typeof CheckCircle2;
    shell: string;
    iconWrap: string;
    title: string;
    source: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    shell: "border-emerald-200 bg-emerald-50 text-emerald-950",
    iconWrap: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-950",
    source: "text-emerald-700",
  },
  error: {
    icon: AlertCircle,
    shell: "border-red-200 bg-red-50 text-red-950",
    iconWrap: "bg-red-100 text-red-700",
    title: "text-red-950",
    source: "text-red-700",
  },
  warning: {
    icon: TriangleAlert,
    shell: "border-amber-200 bg-amber-50 text-amber-950",
    iconWrap: "bg-amber-100 text-amber-700",
    title: "text-amber-950",
    source: "text-amber-700",
  },
  info: {
    icon: Info,
    shell: "border-blue-200 bg-blue-50 text-blue-950",
    iconWrap: "bg-blue-100 text-blue-700",
    title: "text-blue-950",
    source: "text-blue-700",
  },
};

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error instanceof Error && error.message.trim()) return error.message.trim();

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }

  return fallback;
}

export function useNotificationQueue() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissNotification = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotificationInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const notification: AppNotification = {
        id,
        variant: input.variant,
        title: input.title,
        message: input.message,
        source: input.source,
        createdAt: Date.now(),
      };

      setNotifications((current) => [notification, ...current].slice(0, 5));

      const durationMs = input.durationMs ?? (input.variant === "error" ? 8000 : 4500);
      if (durationMs > 0) {
        const timer = window.setTimeout(() => dismissNotification(id), durationMs);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissNotification],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return { notifications, notify, dismissNotification };
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationCenter({ notifications, onDismiss }: NotificationCenterProps) {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity" />
      <div className="relative z-10 flex w-[min(480px,calc(100vw-2rem))] flex-col gap-3 pointer-events-none max-h-[90vh] overflow-y-auto">
      {notifications.map((notification) => {
        const config = VARIANT_CONFIG[notification.variant];
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={cn(
              "pointer-events-auto flex gap-3 rounded-lg border px-3 py-3 shadow-lg shadow-slate-900/10",
              config.shell,
            )}
            role={notification.variant === "error" ? "alert" : "status"}
          >
            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", config.iconWrap)}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-xs font-extrabold uppercase tracking-wide", config.title)}>
                    {notification.title}
                  </p>

                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(notification.id)}
                  className="rounded-md p-1 text-current opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/20"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {notification.message && (
                <p className="mt-1.5 text-[11px] font-semibold leading-snug text-current/80">
                  {notification.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
