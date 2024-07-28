"use client";
// context/VideoLinkContext.js
import React, { createContext, useContext, useState } from "react";

interface VideoLinkContextType {
  videoLink: string;
  setVideoLink: React.Dispatch<React.SetStateAction<string>>;
}

const VideoLinkContext = createContext<VideoLinkContextType | undefined>(
  undefined
);

export const useVideoLink = () => {
  const context = useContext(VideoLinkContext);
  if (!context) {
    throw new Error("useVideoLink must be used within a VideoLinkProvider");
  }
  return context;
};

export const VideoLinkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [videoLink, setVideoLink] = useState(
    typeof window !== "undefined"
      ? window.localStorage.getItem("videoLink") || ""
      : ""
  );

  return (
    <VideoLinkContext.Provider value={{ videoLink, setVideoLink }}>
      {children}
    </VideoLinkContext.Provider>
  );
};
