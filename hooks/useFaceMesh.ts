import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMesh } from "@/utils/testing";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { MeshResult, Prediction, Keypoint } from "@/types/types";
import {
  calculateEAR,
  euclideanDistance,
  isLookingAtScreen,
} from "@/utils/eyeUtils";

export const useFaceMesh = (
  videoRef: React.RefObject<HTMLVideoElement> | null
) => {
  const effectRan = useRef(false);
  const [animate, setAnimate] = useState(false);
  const [lookingAtScreen, setLookingAtScreen] = useState(false);
  const [isForwardNLevel, setIsForwardNLevel] = useState<boolean>(false);
  const [isGazing, setIsGazing] = useState<boolean>(false);
  const meshDataRef = useRef<MeshResult>({
    euclideanDistance: null,
    yaw: null,
    turn: null,
    leftEyePoint: null,
    rightEyePoint: null,
    noseTip: null,
    leftNose: null,
    rightNose: null,
    namedKeypoints: null,
  });

  const UPDATE_MS = 2;
  const intervalRef = useRef<number | null>(null);

  const runFacemesh = useCallback(async () => {
    const detect = async (net: facemesh.FaceLandmarksDetector) => {
      if (videoRef && videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const face = await net.estimateFaces(video);

        if (face.length > 0) {
          const {
            euclideanDistance,
            leftEyePoint,
            rightEyePoint,
            noseTip,
            leftNose,
            rightNose,
            namedKeypoints,
            yaw,
            turn,
          } = getMesh(face as Prediction[]);

          meshDataRef.current = {
            euclideanDistance,
            yaw,
            turn,
            leftEyePoint,
            rightEyePoint,
            noseTip,
            leftNose,
            rightNose,
            namedKeypoints,
          };

          // Check if the user is looking at the screen
          if (
            namedKeypoints &&
            namedKeypoints["leftEye"] &&
            namedKeypoints["rightEye"]
          ) {
            const isLooking = isLookingAtScreen(
              namedKeypoints["leftEye"],
              namedKeypoints["rightEye"]
            );
            setLookingAtScreen(isLooking);
          }

          // Determine if the person is looking forward and head is level
          const isLookingForwardAndLevel = () => {
            if (!meshDataRef.current.yaw || !meshDataRef.current.turn)
              return false;

            const { yaw, turn } = meshDataRef.current;

            // Define thresholds
            const yawThreshold = 100;
            const turnThreshold = 35;
            const UpperBound = 135;

            // Determine if the person is looking forward
            const isLookingForward =
              Math.abs(turn) >= turnThreshold && Math.abs(turn) <= UpperBound;

            return isLookingForward;
          };

          setIsForwardNLevel(isLookingForwardAndLevel());

          setAnimate((prevCheck) => !prevCheck);
        }
      }
    };

    const detectorConfig: facemesh.MediaPipeFaceMeshMediaPipeModelConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
      refineLandmarks: true,
    };

    const detector = await facemesh.createDetector(
      facemesh.SupportedModels.MediaPipeFaceMesh,
      detectorConfig
    );

    intervalRef.current = window.setInterval(() => {
      detect(detector);
    }, UPDATE_MS);
  }, [videoRef]);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    if (effectRan.current === false) {
      runFacemesh();
      effectRan.current = true;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runFacemesh, videoRef]);

  useEffect(() => {
    const isGazing = lookingAtScreen && isForwardNLevel;
    setIsGazing(isGazing);
  }, [lookingAtScreen, isForwardNLevel]);

  return useMemo(
    () => ({
      animate,
      euclideanDistance: meshDataRef.current.euclideanDistance,
      leftEyePoint: meshDataRef.current.leftEyePoint,
      rightEyePoint: meshDataRef.current.rightEyePoint,
      noseTip: meshDataRef.current.noseTip,
      leftNose: meshDataRef.current.leftNose,
      rightNose: meshDataRef.current.rightNose,
      namedKeypoints: meshDataRef.current.namedKeypoints,
      isGazing: isGazing,
    }),
    [animate, euclideanDistance]
  );
};
