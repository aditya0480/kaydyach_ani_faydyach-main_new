import { getComboEbooks } from "@/lib/data-access";
import { CombosSection } from "@/components/marketing/combos-section";

export async function CombosContainer() {
    const combos = await getComboEbooks();

    if (combos.length === 0) return null;

    // Take only the latest 8 for the home page section
    const latestCombos = combos.slice(0, 8);

    return <CombosSection combos={latestCombos} />;
}
