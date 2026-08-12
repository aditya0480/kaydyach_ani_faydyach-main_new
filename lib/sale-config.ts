// Helper to get end of today (midnight) for the daily sale
const getEndOfToday = () => {
    const now = new Date();
    const tonight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return tonight.toISOString();
};

export const SALE_CONFIG = {
    isActive: true, // Should always stay true for the daily loop
    discountPercent: 50,
    get endDate() {
        return getEndOfToday();
    },
    name: "Golden Hours Flash Sale",
    badgeLabel: "ऑफर मर्यादित वेळेसाठी फक्त"
};

export const getInflatedOriginalPrice = (currentPrice: number) => {
    return Math.round(currentPrice * 2.0);
};
