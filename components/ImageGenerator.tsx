import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, Settings } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ImageDisplay } from "./ImageDisplay";

// ❌ Se elimina la importación de "@/lib/image-types"
// import { GeneratedImage, ImageError, ProviderTiming } from "@/lib/image-types";

// ✅ Se definen solo las interfaces necesarias directamente aquí
interface GeneratedImage {
  provider: string;
  image: string | null;
  modelId?: string;
}

interface ImageError {
  provider: string;
  message: string;
}

interface ProviderTiming {
  startTime?: number;
  completionTime?: number;
  elapsed?: number;
}

interface ImageGeneratorProps {
  images: GeneratedImage[];
  errors: ImageError[];
  failedProviders: string[];
  timings: Record<string, ProviderTiming>;
  enabledProviders: Record<string, boolean>;
  toggleView: () => void;
}

export function ImageGenerator({
  images,
  errors,
  failedProviders,
  timings,
  enabledProviders,
  toggleView,
}: ImageGeneratorProps) {
  return (
    <div className="space-y-6">
      {/* If there are errors, render a collapsible alert */}
      {errors.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              {errors.length} {errors.length === 1 ? "error" : "errors"}{" "}
              occurred
              <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 mt-2">
              {errors.map((err, index) => (
                <Alert key={index} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-3">
                    <AlertTitle className="capitalize">
                      {err.provider} Error
                    </AlertTitle>
                    <AlertDescription className="mt-1 text-sm">
                      {err.message}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Generated Images</h3>
        <Button
          variant="outline"
          className=""
          onClick={() => toggleView()}
          size="icon"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop layout: Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 2xl:grid-cols-4 gap-6">
        {images.map((imageItem) => {
          const imageData = imageItem.image;
          const timing = timings[imageItem.provider];

          return (
            <ImageDisplay
              key={imageItem.provider}
              provider={imageItem.provider}
              image={imageData}
              timing={timing}
              failed={failedProviders.includes(imageItem.provider)}
              enabled={enabledProviders[imageItem.provider]}
              modelId={imageItem?.modelId ?? ""}
            />
          );
        })}
      </div>
    </div>
  );
}
