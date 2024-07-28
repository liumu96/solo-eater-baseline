"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useVideo } from "./VideoContext";
import { useFaceMesh } from "@/hooks/useFaceMesh";
import useSignalProcessing from "@/hooks/useSignalProcessing";
import { avgFrequency } from "@/utils/avgFrequency";
import useVideoRef from "@/hooks/useVideoRef";

// 定义上下文类型
interface ChewingFrequencyContextType {
  chewingFrequency: number | null;
}

// 创建上下文
const ChewingFrequencyContext = createContext<ChewingFrequencyContextType>({
  chewingFrequency: null,
});

// 自定义 hook 来使用上下文
export const useChewingFrequency = () => useContext(ChewingFrequencyContext);

// Chewing Frequency Provider
export const ChewingFrequencyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const videoRef = useVideoRef();
  const [chewingFrequency, setChewingFrequency] = useState<number | null>(null); // Initial state set to null
  const [cutOffFrequency] = useState(0.12);
  const [itemsNo] = useState(240);

  const {
    animate,
    noseTip,
    euclideanDistance,
  } = useFaceMesh(videoRef);

  const signalProcessingData = useSignalProcessing(
    animate,
    noseTip,
    euclideanDistance,
    cutOffFrequency,
    itemsNo
  );

  // Use useEffect to defer client-specific logic
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on the client
      const calculateChewingFrequency = () => {
        const frequency = avgFrequency(signalProcessingData.filteredPeaks, 2.5);
        setChewingFrequency(frequency);
      };

      // Execute the logic to calculate chewing frequency
      calculateChewingFrequency();
    }
  }, [animate]);

  // Create the context value
  const contextValue: ChewingFrequencyContextType = {
    chewingFrequency: chewingFrequency,
  };

  // Return the context provider with the children
  return (
    <ChewingFrequencyContext.Provider value={contextValue}>
      {children}
    </ChewingFrequencyContext.Provider>
  );
};
