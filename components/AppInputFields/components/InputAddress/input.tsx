import { FormField } from "@/components/ui/form";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputFieldProps } from "../../InputField";
import AddressInput from "./components/mini_form";

const InputAddress: React.FC<Omit<InputFieldProps, "form">> = (props) => {
  const { name } = props;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const form = useFormContext();

  if (!form) {
    throw new Error("InputAddress must be used within a FormProvider");
  }

  // Watch for country changes to set default
  const countryValue = form.watch(`${name}.country`);
  
  // Assuming userCountry is defined elsewhere or passed as props
  // For demonstration, let's define them as placeholders
  const userCountry = "US"; 
  
  useEffect(() => {
    if (!countryValue && userCountry) {
      if (userCountry.toUpperCase() === "IN") {
        form.setValue(`${name}.country`, "India", { shouldValidate: true });
      }
    }
  }, [countryValue, userCountry, form, name]);

  useEffect(() => {
    if (!apiKey) return; // Handle missing API key inside effect or just let it fail/handle in render
    
    const scriptId = "google-maps-script";

    // 2. Handle Google Maps Authentication Failure
    // @ts-expect-error - Google Maps API might not be loaded yet
    window.gm_authFailure = () => {
      setLoadError("Google Maps API Key is invalid. Please check your console for more details.");
    };

    if (window.google && window.google.maps) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Script is loaded, just syncing state
      setScriptLoaded(true);
      return;
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setLoadError("Failed to load Google Maps script. Please check your connection.");
      };
      document.body.appendChild(script);
    }

    const onScriptLoad = () => setScriptLoaded(true);
    script.addEventListener("load", onScriptLoad);

    return () => {
      script.removeEventListener("load", onScriptLoad);
    };
  }, [apiKey]);

  // 1. Check if API Key is missing and return early
  if (!apiKey) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        <p className="font-semibold">Configuration Error</p>
        <p>Google Maps API Key is missing. Please add it to your environment variables.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        <p className="font-semibold">Map Error</p>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!scriptLoaded) {
    return <p className="animate-pulse text-sm text-muted-foreground">Loading Map...</p>;
  }

  // Use scriptLoaded as a proxy for isLoaded in this context
  const isLoaded = scriptLoaded;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <FormField
      disabled={props.disabled}
      control={form.control}
      name={name}
      render={({ field }) => (
        <AddressInput
          field={field}
          inputProps={{
            ...props,
            Icon: props.Icon,
          }}
        />
      )}
    />
  );
};

export default React.memo(InputAddress);
