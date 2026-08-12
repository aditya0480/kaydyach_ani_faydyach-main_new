import CreateEbookForm from "./create-form";

export default function NewEbookPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 p-2 duration-500 md:p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-teal">Add New Ebook / नवीन पुस्तक जोडा</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Fill in the details below to add a new digital product to your library.</p>
                </div>
            </div>

            <CreateEbookForm />
        </div>
    );
}
