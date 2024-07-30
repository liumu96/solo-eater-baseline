export function avgFrequency(peaks, currentTime, windowSize) {
  if (!peaks || peaks.length === 0) {
    return 0;
  }

  // Calculate window size in milliseconds
  const windowSizeInMilliseconds = windowSize * 1000;

  // Calculate the start of the time window
  const timeWindowStart = currentTime - windowSizeInMilliseconds;
  // console.log("Current Time (ms):", currentTime);
  // console.log("Time Window Start (ms):", timeWindowStart);

  // Filter peaks based on the time window
  const totalPeaksCount = peaks.filter(
    (peak) => peak.time.getTime() > timeWindowStart
  ).length;
  // console.log("Filtered Peaks Count:", totalPeaksCount);

  if (totalPeaksCount === 0) {
    return 0;
  }

  // Calculate frequency in peaks per second and convert to BPM
  const frequency = totalPeaksCount / windowSize;
  return Math.round(frequency * 60); // Convert to BPM
}
