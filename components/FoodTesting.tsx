"use client";
import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import quantize, { RgbPixel } from "quantize";
import { useVideo } from "@/context/VideoContext";
import { useData } from "@/context/DataContext";

const FoodTesting: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // our canvas
  const { videoRef } = useVideo();
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [foodDetected, setFoodDetected] = useState<boolean>(false);
  const { setDominantColors } = useData();

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const handleMetadataLoaded = () => {
      if (videoRef.current && canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }
    };

    const detectFood = async () => {
      if (videoRef.current && canvas && model) {
        if (
          videoRef.current.videoWidth === 0 ||
          videoRef.current.videoHeight === 0
        ) {
          requestAnimationFrame(detectFood);
          return;
        }

        const predictions = await model.detect(videoRef.current);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const foodClasses = [
          "banana",
          "apple",
          "orange",
          "sandwich",
          "cake",
          "hot dog",
          "pizza",
          "donut",
          "carrot",
          "bottle",
          "bowl",
          "cup",
          "spoon",
          "fork",
        ];
        const foodPixels: RgbPixel[] = [];

        predictions.forEach((prediction: cocoSsd.DetectedObject) => {
          if (
            prediction.score > 0.5 &&
            foodClasses.includes(prediction.class)
          ) {
            setFoodDetected(true);
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = "green";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
        
            const imageData = ctx.getImageData(x, y, width, height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              const r = imageData.data[i];
              const g = imageData.data[i + 1];
              const b = imageData.data[i + 2];
        
              // Skip the green pixels used for bounding box
              if (r === 0 && g === 255 && b === 0) {
                continue;
              }
        
              foodPixels.push([r, g, b]);
            }
          }
        });
        
        if (foodPixels.length > 0) {
          const colorMap = quantize(foodPixels, 5);
          if (colorMap) {
            const colors = colorMap.palette();
            setDominantColors(colors);
          }
        };
        

        const message = document.getElementById("message");
        if (message) {
          if (!foodDetected) {
            message.textContent =
              "No food detected. Please place the food in the center of the camera view.";
          } else {
            message.textContent = "";
          }
        }
      }

      requestAnimationFrame(detectFood);
    };

    videoRef.current.addEventListener("loadedmetadata", handleMetadataLoaded);

    const animationId = requestAnimationFrame(detectFood);

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleMetadataLoaded
        );
      }
      cancelAnimationFrame(animationId);
    };
  }, [videoRef, canvasRef, model]);

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div
        id="message"
        className="absolute top-0 w-full text-center text-red-600 z-30"
      ></div>
      <video
        ref={videoRef}
        id="video"
        autoPlay={true}
        className="absolute top-8 left-0 w-full h-full object-contain z-10"
      />

      <canvas
        ref={canvasRef}
        className="absolute top-8 left-0 w-full h-full object-contain z-20 pointer-events-none"
      />
    </div>
  );
};

export default FoodTesting;
