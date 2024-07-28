"use client";
import React, { useState, useEffect, useRef } from "react";

const CameraPreview: React.FC = () => {
  const [maximized, setMaximized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 获取摄像头权限并展示视频流
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera", error);
      }
    };
    requestCameraPermission();
  }, []);

  // 切换最大化和最小化
  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  return (
    <div
      onClick={toggleMaximize}
      style={{
        position: "fixed",
        bottom: maximized ? "50%" : "20px",
        right: maximized ? "50%" : "20px",
        transform: maximized ? "translate(50%, 50%)" : "none",
        zIndex: 9999,
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        borderRadius: maximized ? "0" : "50%",
        overflow: "hidden",
        width: maximized ? "80%" : "100px",
        height: maximized ? "80%" : "100px",
        maxWidth: maximized ? "800px" : "100px",
        maxHeight: maximized ? "600px" : "100px",
        border: "1px solid #000",
      }}
    >
      <video
        ref={videoRef}
        autoPlay={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default CameraPreview;
