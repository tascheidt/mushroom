"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ObservationForm } from "./ObservationForm";
import type { MushroomIdentification } from "../types/mushroom";
import { Camera, Loader2, CheckCircle2, Play } from "lucide-react";
import { fetchImages, analyzeImage, saveObservation } from "../utils/api";

type ImageManagerProps = {
  onObservationSaved: () => void;
  externalSelectedImage?: string | null;
  externalAnalysisResult?: Partial<MushroomIdentification> | null;
  onExternalStateChange?: (image: string | null, result: Partial<MushroomIdentification> | null) => void;
};

export function ImageManager({ 
  onObservationSaved,
  externalSelectedImage,
  externalAnalysisResult,
  onExternalStateChange,
}: ImageManagerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [internalSelectedImage, setInternalSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [internalAnalysisResult, setInternalAnalysisResult] = useState<Partial<MushroomIdentification> | null>(null);
  const [saving, setSaving] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Use external state if provided, otherwise use internal state
  const selectedImage = externalSelectedImage !== undefined ? externalSelectedImage : internalSelectedImage;
  const analysisResult = externalAnalysisResult !== undefined ? externalAnalysisResult : internalAnalysisResult;
  
  const setSelectedImage = (image: string | null) => {
    if (onExternalStateChange) {
      onExternalStateChange(image, analysisResult);
    } else {
      setInternalSelectedImage(image);
    }
  };
  
  const setAnalysisResult = (result: Partial<MushroomIdentification> | null) => {
    if (onExternalStateChange) {
      onExternalStateChange(selectedImage, result);
    } else {
      setInternalAnalysisResult(result);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const data = await fetchImages();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }

  async function handleAnalyzeImage(imageFile: string) {
    setAnalyzing(true);
    setSelectedImage(imageFile);
    try {
      const result = await analyzeImage(imageFile);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image");
    } finally {
      setAnalyzing(false);
    }
  }

  async function processBatch() {
    if (images.length === 0 || batchProcessing) return;

    setBatchProcessing(true);
    setBatchProgress({ current: 0, total: images.length });

    const imagesToProcess = [...images];
    
    for (let i = 0; i < imagesToProcess.length; i++) {
      const imageFile = imagesToProcess[i];
      console.log(`[Batch] Starting processing for ${imageFile} (${i + 1}/${imagesToProcess.length})`);
      setBatchProgress({ current: i + 1, total: imagesToProcess.length });

      try {
        // Step 1: Analyze the image
        console.log(`[Batch] Step 1: Analyzing ${imageFile}...`);
        const analysisResult = await analyzeImage(imageFile);
        console.log(`[Batch] Step 1: Analysis complete for ${imageFile}`, {
          hasScientificName: !!analysisResult.scientificName,
          hasCommonName: !!analysisResult.commonName,
          hasKeyFeatures: !!analysisResult.keyFeatures,
          hasInfoCard: !!analysisResult.infoCardImage,
          location: analysisResult.location,
        });
        
        // Step 2: Validate the analysis result
        if (!analysisResult.scientificName || !analysisResult.commonName || !analysisResult.keyFeatures) {
          console.error(`[Batch] Invalid analysis result for ${imageFile} - missing required fields`);
          continue;
        }
        
        // Step 3: Prepare observation with all required fields
        const observation: MushroomIdentification = {
          imageFile: analysisResult.imageFile || imageFile,
          scientificName: analysisResult.scientificName,
          commonName: analysisResult.commonName,
          confidence: analysisResult.confidence || 0,
          edibility: analysisResult.edibility || "Unknown",
          warning: analysisResult.warning || "Never consume wild mushrooms without expert identification.",
          keyFeatures: analysisResult.keyFeatures,
          ecologicalRole: analysisResult.ecologicalRole || "Unknown",
          habitatNotes: analysisResult.habitatNotes || "",
          funFact: analysisResult.funFact || "",
          cookingOrUsage: analysisResult.cookingOrUsage || "",
          location: analysisResult.location || "Unknown",
          locationData: analysisResult.locationData,
          observationDate: analysisResult.observationDate,
          observationTime: analysisResult.observationTime,
          weather: analysisResult.weather,
          infoCardImage: analysisResult.infoCardImage,
        };

        console.log(`[Batch] Step 2: Prepared observation for ${imageFile}`);

        // Step 4: Save the observation
        console.log(`[Batch] Step 3: Saving ${imageFile}...`);
        const savedObservation = await saveObservation(observation);
        console.log(`[Batch] Step 3: Successfully saved ${imageFile}`, {
          savedImageFile: savedObservation.imageFile,
        });
        
        // Step 5: Update UI state
        console.log(`[Batch] Step 4: Updating UI state for ${imageFile}`);
        setImages((prev) => prev.filter((img) => img !== imageFile));
        
        // Step 6: Notify parent component
        console.log(`[Batch] Step 5: Notifying parent component for ${imageFile}`);
        onObservationSaved();
        
        console.log(`[Batch] ✓ Completed processing ${imageFile}`);
      } catch (error) {
        console.error(`[Batch] ✗ Error processing ${imageFile}:`, error);
        if (error instanceof Error) {
          console.error(`[Batch] Error message: ${error.message}`);
          console.error(`[Batch] Error stack:`, error.stack);
        }
        // Continue with next image even if one fails
      }
    }

    console.log(`[Batch] All images processed. Final count: ${imagesToProcess.length}`);
    setBatchProcessing(false);
    setBatchProgress(null);
  }

  async function handleSave(observation: MushroomIdentification) {
    setSaving(true);
    try {
      await saveObservation(observation);
      setSelectedImage(null);
      setAnalysisResult(null);
      onObservationSaved();
      // Remove processed image from list
      setImages((prev) => prev.filter((img) => img !== observation.imageFile));
    } catch (error) {
      console.error("Error saving observation:", error);
      alert("Failed to save observation");
    } finally {
      setSaving(false);
    }
  }

  // Show observation form if we have a selected image (either new or editing existing)
  if (selectedImage && analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Add Observation Details</h3>
          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              setAnalysisResult(null);
            }}
            className="text-xs text-neutral-600 hover:text-neutral-900"
          >
            ← Back to images
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <Image
              src={`/images/${selectedImage}`}
              alt="Selected mushroom"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <ObservationForm
              imageFile={selectedImage}
              initialData={analysisResult}
              onSave={handleSave}
              onCancel={() => {
                setSelectedImage(null);
                setAnalysisResult(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show "no images" message only if we're not editing an existing observation
  if (images.length === 0 && !selectedImage) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center">
        <Camera className="mx-auto h-12 w-12 text-neutral-400" />
        <p className="mt-4 text-sm font-medium text-neutral-900">No unprocessed images</p>
        <p className="mt-2 text-xs text-neutral-600">
          Add photos to <code className="rounded bg-white px-1.5 py-0.5">public/images</code> to get started, or edit an existing observation below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          Unprocessed Images ({images.length})
        </h3>
        <div className="flex items-center gap-2">
          {batchProgress && (
            <span className="text-xs text-neutral-600">
              Processing {batchProgress.current} of {batchProgress.total}...
            </span>
          )}
          {images.length > 0 && !batchProcessing && (
            <button
              type="button"
              onClick={processBatch}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <Play className="h-3.5 w-3.5" />
              Analyze All
            </button>
          )}
          <button
            type="button"
            onClick={loadImages}
            disabled={batchProcessing}
            className="text-xs text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
      {batchProcessing && batchProgress && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900">
                Processing image {batchProgress.current} of {batchProgress.total}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((imageFile) => (
          <button
            key={imageFile}
            type="button"
            onClick={() => handleAnalyzeImage(imageFile)}
            disabled={analyzing || batchProcessing}
            className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 transition hover:border-emerald-400 hover:shadow-md disabled:opacity-50"
          >
            <Image
              src={`/images/${imageFile}`}
              alt={imageFile}
              fill
              className="object-cover"
            />
            {analyzing && selectedImage === imageFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs font-medium text-white">Click to analyze</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

