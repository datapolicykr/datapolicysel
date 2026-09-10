"use client";

import { useEffect } from "react";

type Target = {
  id: string | number;
  clinicName?: string;
  monthlyCost?: string;
  managementFee?: string;
  linkFee?: string;
};

type SurveySummary = { targets?: Target[] };

const DEFAULT_COSTS: Record<string, number> = {
  "단말기": 180000,
  "관리비": 360000,
  "연동비": 540000,
  "소모품": 90000,
};

const money = (value: unknown) => {
  const matched = String(value ?? "").match(/[\d,]+/);
  return Number((matched?.[0] ?? "0").replaceAll(",", "")) || 0;
};

const formatThreeYear = (amount: number) => `${amount.toLocaleString("ko-KR")}원/3년`;

function setReactTextareaValue(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function ComparisonCostSync() {
  useEffect(() => {
    let targets: Target[] = [];
    let loading: Promise<void> | null = null;

    const loadTargets = async () => {
      if (targets.length) return;
      if (loading) return loading;
      loading = fetch("/api/surveys", { cache: "no-store" })
        .then(async (r) => {
          if (!r.ok) return;
          const data = (await r.json()) as SurveySummary;
          targets = data.targets ?? [];
        })
        .catch(() => undefined)
        .finally(() => {
          loading = null;
        });
      return loading;
    };

    const apply = async (select: HTMLSelectElement) => {
      await loadTargets();
      const selectedId = select.value;
      const target = selectedId ? targets.find((x) => String(x.id) === selectedId) : undefined;

      const values: Record<string, string> = target
        ? {
            "단말기": formatThreeYear(money(target.monthlyCost) * 36),
            "관리비": formatThreeYear(money(target.managementFee) * 36),
            "연동비": formatThreeYear(money(target.linkFee) * 36),
            "소모품": formatThreeYear(90000),
          }
        : Object.fromEntries(Object.entries(DEFAULT_COSTS).map(([k, v]) => [k, formatThreeYear(v)]));

      for (const [item, value] of Object.entries(values)) {
        const el = document.querySelector<HTMLTextAreaElement>(`.compare-page textarea[aria-label="${item} 현재 사용"]`);
        if (el && el.value !== value) setReactTextareaValue(el, value);
      }
    };

    const attach = () => {
      const select = document.querySelector<HTMLSelectElement>(".compare-page .compare-tools select");
      if (!select || select.dataset.costSyncAttached === "1") return;
      select.dataset.costSyncAttached = "1";
      const onChange = () => window.setTimeout(() => void apply(select), 0);
      select.addEventListener("change", onChange);
      window.setTimeout(() => void apply(select), 0);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
