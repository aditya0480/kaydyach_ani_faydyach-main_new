"use client";

import { useEffect } from "react";

interface Props {
  orderId: string;
  amount: number;
  currency: string;
  contentName: string;
  contentIds: string[];
}

export function PixelPurchaseTracker({ orderId, amount, currency, contentName, contentIds }: Props) {
  useEffect(() => {
    const eventId = `purchase_${orderId}`;
    const fire = () => {
      window.fbq!(
        "track",
        "Purchase",
        {
          value: amount,
          currency,
          content_name: contentName,
          content_type: "product",
          content_ids: contentIds,
        },
        { eventID: eventId },
      );
    };

    if (window.fbq) {
      fire();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.fbq) {
          clearInterval(interval);
          fire();
        } else if (attempts >= 100) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
