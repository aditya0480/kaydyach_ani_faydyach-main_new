import { getEbooks } from "@/lib/data-access";
import { EbooksSection } from "@/components/marketing/ebooks-section";

export async function EbooksContainer() {
    const ebooks = await getEbooks();

    // Take only the latest 6 for the home page section
    const latestEbooks = ebooks.slice(0, 6);

    return <EbooksSection ebooks={latestEbooks} />;
}
