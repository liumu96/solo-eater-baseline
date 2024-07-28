// context/VideoContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  ReactNode,
} from "react";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
  requestCameraPermission: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => string;
  downloadRecording: () => void;
}

interface VideoProviderProps {
  children: ReactNode;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setStream(videoStream);

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (error) {
      console.error("Error accessing camera", error);
    }
  };

  // useEffect(() => {
  //   console.log(videoRef.current, "videoRef.current");
  //   if (videoRef.current) {
  //     requestCameraPermission();
  //   }
  // }, [videoRef.current]);

  useEffect(() => {
    if (stream) {
      // Initialize MediaRecorder with the stream
      const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });

      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      setMediaRecorder(recorder);
    }
  }, [stream]);

  useEffect(() => {
    if (!isRecording && recordedChunks.length) {
      // download video
      downloadRecording();
    }
  }, [isRecording, recordedChunks]);

  const startRecording = () => {
    if (mediaRecorder && !isRecording) {
      console.log(3333333);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      return "";
    } else {
      return "Video download failed!";
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded-video.mp4";
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]); // 清空已录制的数据
    }
  };

  const videoValue = {
    videoRef,
    stream,
    mediaRecorder,
    recordedChunks,
    requestCameraPermission,
    startRecording,
    stopRecording,
    downloadRecording,
  };

  return (
    <VideoContext.Provider value={videoValue}>{children}</VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
