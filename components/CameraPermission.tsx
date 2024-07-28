"use client";

import { useEffect } from "react";

const CameraPermission = () => {
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log("Camera access granted");
      } catch (error) {
        console.error("Camera access denied", error);
      }
    };
    requestCameraPermission();
  }, []);

  return null;
};

export default CameraPermission;
