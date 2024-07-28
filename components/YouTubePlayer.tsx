"use client";
import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useVideo } from "@/context/VideoContext";
import ConfirmationDialog from "./ConfirmationDialog";

interface BorderColor {
  color: string;
  percentage: string;
}

interface YouTubePlayerProps {
  videoId: string;
  borderColors?: BorderColor[];
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const router = useRouter();
  const playerRef = useRef<any>(null);
  const targetPlaybackRateRef = useRef<number>(0.83);
  const [autoRateChange, setAutoRateChange] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseTimes, setPauseTimes] = useState<number[]>([]);
  const [resumeTimes, setResumeTimes] = useState<number[]>([]);
  const { setVideoPlayInfo } = useData();
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPauseTimeRef = useRef<number | null>(null);

  // Video Recording
  const { startRecording, stopRecording } = useVideo();
  const [startPlay, setStartPlay] = useState(false);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      fs: 0,
      rel: 0, // 禁用推荐视频
      modestbranding: 1, // 隐藏YouTube logo
      enablejsapi: 1,
    },
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // startReducingPlaybackRate();
    setStartTime(Date.now());
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) {
      // 视频开始播放
      if (!startPlay) {
        setStartPlay(true);
        // startReducingPlaybackRate();
        startRecording();
      } else {
        // 视频恢复播放
        if (
          lastPauseTimeRef.current &&
          Date.now() - lastPauseTimeRef.current < 5000
        ) {
          // 视频跳转
          clearTimeout(pauseTimeoutRef.current!);
        } else {
          setResumeTimes((prev) => [...prev, Date.now()]);
        }
      }
    } else if (event.data === 2) {
      // 视频暂停
      lastPauseTimeRef.current = Date.now();
      pauseTimeoutRef.current = setTimeout(() => {
        setPauseTimes((prev) => [...prev, lastPauseTimeRef.current!]);
        handlePause();
      }, 5000); // 改为5秒，以确保弹出确认对话框
    }
  };

  const handlePause = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    const errorInfo = stopRecording();
    if (errorInfo) {
      alert(errorInfo);
    } else {
      setDialogOpen(false);
      setVideoPlayInfo({
        startTime: new Date(startTime!),
        stopTime: new Date(pauseTimes[pauseTimes.length - 1]),
        pauseTimes: pauseTimes.map((time) => new Date(time)),
        resumeTimes: resumeTimes.map((time) => new Date(time)),
      });
      router.push("/userdata");
    }
  };

  const onPlaybackRateChange = () => {
    if (autoRateChange) return;
    const speed = playerRef.current.getPlaybackRate();
    targetPlaybackRateRef.current = speed * 0.83;
    startReducingPlaybackRate();
  };

  const startReducingPlaybackRate = () => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentRate = playerRef.current.getPlaybackRate();
        if (currentRate > targetPlaybackRateRef.current) {
          if (!autoRateChange) {
            setAutoRateChange(true);
          }
          playerRef.current.setPlaybackRate(
            Math.max(targetPlaybackRateRef.current, currentRate - 0.01)
          );
        } else {
          clearInterval(interval);
          setAutoRateChange(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="w-full h-full">
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
};

export default YouTubePlayer;
