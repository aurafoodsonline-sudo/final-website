"use client";
import { useEffect, useState } from "react";
import { DEFAULT_DELIVERY_RATES, parseRate, type DeliveryRates } from "./pricing";

// Loads the live delivery fee from the server. `ready` stays false until it has arrived, so
// pages can avoid showing a total that might change a moment later.
export function useDeliveryRates() {
  const [rates, setRates] = useState<DeliveryRates>(DEFAULT_DELIVERY_RATES);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/delivery-rates", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setRates({
          deliveryCharge: parseRate(data.deliveryCharge, DEFAULT_DELIVERY_RATES.deliveryCharge),
          freeDeliveryFrom: parseRate(data.freeDeliveryFrom, DEFAULT_DELIVERY_RATES.freeDeliveryFrom),
        });
      })
      .catch(() => { /* keep defaults; the server still calculates the real total at checkout */ })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);
  return { rates, ready };
}
