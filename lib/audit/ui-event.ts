export type UiEventInput = {
  entity: string;
  action: string;
  summary: string;
};

export function auditUiEvent(event: UiEventInput) {
  if (typeof window === "undefined") return;

  void fetch("/api/audit/ui-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, summary: event.summary.slice(0, 200), path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
}
