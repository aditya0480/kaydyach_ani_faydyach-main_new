"use client";

import { useEffect } from "react";

interface Props {
  ebookId: string;
  title: string;
  price: number;
}

export function PixelViewContent({ ebookId, title, price }: Props) {
  useEffect(() => {
    const eventId = `vc_${ebookId}_${Date.now()}`;
    const fire = () => {
      window.fbq!(
        "track",
        "ViewContent",
        {
          content_ids: [ebookId],
          content_type: "product",
          content_name: title,
          value: price,
          currency: "INR",
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
