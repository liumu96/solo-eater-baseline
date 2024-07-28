import { useEffect, useMemo, useRef } from "react";
import findPeaksP3 from "@/utils/findPeaksP3";

function pointLowPassFilter(
  prev: number,
  newItem: SignalDataItem,
  cutoffFreq: number,
  sampleRate: number
) {
  const RC = 1 / (2 * Math.PI * cutoffFreq);
  const dt = 1 / sampleRate;
  const alpha = dt / (dt + RC);
  let current = alpha * newItem.value + (1 - alpha) * prev;
  return current;
}

function euclideanDistance(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function calculateCorrelation(arr1: any[], arr2: any[], windowSize: number) {
  if (arr1.length !== arr2.length) {
    console.error("Arrays must have the same length");
    return null;
  }

  const arr1Values = arr1.map((item: { value: any }) => item.value);
  const arr2Values = arr2.map((item: { value: any }) => item.value);

  const mean = (data: any[]) => {
    return data.reduce((a: any, b: any) => a + b) / data.length;
  };

  const stdDev = (data: any[], dataMean: number) => {
    const sqDiff = data.map((item: number) => Math.pow(item - dataMean, 2));
    return Math.sqrt(sqDiff.reduce((a: any, b: any) => a + b) / sqDiff.length);
  };

  const correlationCoefficients = [];

  for (let i = 0; i <= arr1.length - windowSize; i++) {
    const arr1Window = arr1Values.slice(i, i + windowSize);
    const arr2Window = arr2Values.slice(i, i + windowSize);

    const arr1Mean = mean(arr1Window);
    const arr2Mean = mean(arr2Window);

    const arr1StdDev = stdDev(arr1Window, arr1Mean);
    const arr2StdDev = stdDev(arr2Window, arr2Mean);

    let correlationCoefficient = 0;
    for (let j = 0; j < windowSize; j++) {
      correlationCoefficient +=
        ((arr1Window[j] - arr1Mean) * (arr2Window[j] - arr2Mean)) /
        (arr1StdDev * arr2StdDev);
    }
    correlationCoefficient /= windowSize;

    correlationCoefficients.push({
      value: Math.abs(correlationCoefficient),
      time: arr1[i + Math.floor(windowSize / 2)].time, // use the middle time of the window
    });
  }

  return correlationCoefficients;
}

export default function useSignalProcessing(
  animate: boolean,
  noseTip: { x: number; y: number } | null,
  newItem: SignalDataItem | null,
  cutOffFrequency: number,
  itemsNo: number
) {
  const dataRef = useRef<SignalProcessingResult>({
    data: [],
    filteredData: [],
    herz: 0,
    peaks: [],
    newFilteredItem: null,
    nosePointDistance: [],
    filteredPeaks: [],
    removedPeaks: [],
  });
  useEffect(() => {
    if (!newItem || newItem === undefined) return;

    const updateDataRef = (
      dataProperty: keyof SignalProcessingResult,
      newValue: any
    ) => {
      dataRef.current = { ...dataRef.current, [dataProperty]: newValue };
    };

    let data = dataRef.current.data;
    let filteredData = dataRef.current.filteredData;
    let nosePointDistance = dataRef.current.nosePointDistance;

    if (data.length >= 10) {
      let prev;
      if (filteredData.length === 0) {
        prev = data.slice(-1)[0];
      } else {
        prev = filteredData.slice(-1)[0];
      }
      let elapsed = newItem.time.getTime() - prev.time.getTime();
      let herz = 1 / (elapsed / 1000);
      updateDataRef("herz", herz);

      let newFilteredItem = {
        value: pointLowPassFilter(prev.value, newItem, 1, herz
        ),
        time: newItem.time,
      };
      updateDataRef("newFilteredItem", newFilteredItem);

      const peakIndexes = findPeaksP3(filteredData, cutOffFrequency);
      const peaks = peakIndexes.map((i) => filteredData[i]);
      updateDataRef("peaks", peaks);

      const windowSize = 5;
      const threshold = 0.8; // set a threshold for the correlation coefficient

      const correlationCoefficients = calculateCorrelation(
        filteredData,
        nosePointDistance,
        windowSize
      );

      const { filteredPeaks, removedPeaks } = peaks?.reduce<
        Record<string, any>
      >(
        (result, peak) => {
          const correspondingCoefficient = correlationCoefficients?.find(
            (coefficient) => coefficient.time.getTime() === peak.time.getTime()
          );

          const text = correspondingCoefficient
            ? correspondingCoefficient.value.toFixed(2)
            : "";
          if (
            !correspondingCoefficient ||
            correspondingCoefficient.value < threshold
          ) {
            result.filteredPeaks.push({ ...peak, text });
          } else {
            result.removedPeaks.push({ ...peak, text });
          }

          return result;
        },
        { filteredPeaks: [], removedPeaks: [] }
      );
      updateDataRef("filteredPeaks", filteredPeaks);
      updateDataRef("removedPeaks", removedPeaks);

      updateDataRef("filteredData", [
        ...filteredData.slice(-itemsNo),
        newFilteredItem,
      ]);

      if (noseTip) {
        const newNosePointDistance = {
          value: euclideanDistance(noseTip.x, noseTip.y),
          time: newItem.time,
        };
        updateDataRef("nosePointDistance", [
          ...nosePointDistance.slice(-itemsNo),
          newNosePointDistance,
        ]);
      }
    }

    // Immediate zero detection
    const newFilteredItem = dataRef.current.newFilteredItem;
    if (newFilteredItem && newFilteredItem.value < 20) {
      updateDataRef("filteredPeaks", []);
      updateDataRef("removedPeaks", []);
    }
    updateDataRef("data", [...data.slice(-itemsNo), newItem]);
  }, [animate, newItem, noseTip, cutOffFrequency, itemsNo, dataRef.current.herz]);

  return useMemo(() => {
    return {
      data: dataRef.current.data,
      filteredData: dataRef.current.filteredData,
      herz: dataRef.current.herz,
      peaks: dataRef.current.peaks,
      newFilteredItem: dataRef.current.newFilteredItem,
      nosePointDistance: dataRef.current.nosePointDistance,
      filteredPeaks: dataRef.current.filteredPeaks,
      removedPeaks: dataRef.current.removedPeaks,
    };
  }, [animate]);
}

