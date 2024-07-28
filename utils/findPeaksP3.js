export default function findPeaksP3(signal, threshold) {
    signal = signal.map(signal => signal.value);
    // Step 1: Find local maxima
    const peaks = [];

    for (let i = 1; i < signal.length - 1; i++) {
        if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
            peaks.push(i);
        }
    }

    // Step 2: Compute left and right slopes
    const leftSlopes = [];
    const rightSlopes = [];
    for (let i = 0; i < peaks.length; i++) {
        const index = peaks[i];
        const offset = 2;
        let maxIndex = index - offset;
        let minIndex = index + offset;
        if (minIndex >= 0 && maxIndex <= signal.length - 1) {
            const leftSlope = signal[index] - signal[maxIndex];
            const rightSlope = signal[minIndex] - signal[index];
            leftSlopes.push(leftSlope);
            rightSlopes.push(rightSlope);
        } else {
            leftSlopes.push(0);
            rightSlopes.push(0);
        }
    }


    // Step 3: Discard peaks with slopes below threshold
    const filteredPeaksIndexes = peaks.filter((peak, i) => 
        (leftSlopes[i] > threshold && Math.abs(rightSlopes[i]) > threshold))

    return filteredPeaksIndexes;
}