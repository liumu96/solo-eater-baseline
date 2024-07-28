import { Keypoint } from "@/types/types"; // Adjust the import path as necessary

export function calculateEAR(eye: Keypoint[]): number {
  const A = euclideanDistance(eye[1], eye[5]); // Vertical distance
  const B = euclideanDistance(eye[2], eye[4]); // Vertical distance
  const C = euclideanDistance(eye[0], eye[3]); // Horizontal distance

  // EAR formula
  const EAR = (A + B) / (2.0 * C);
  return EAR;
}

export function euclideanDistance(point1: Keypoint, point2: Keypoint): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isLookingAtScreen(leftEye: Keypoint[], rightEye: Keypoint[]): boolean {
  const leftEAR = calculateEAR(leftEye);
  const rightEAR = calculateEAR(rightEye);

  // Threshold for EAR to consider eyes open
  const EAR_THRESHOLD = 0.2;

  if (leftEAR < EAR_THRESHOLD || rightEAR < EAR_THRESHOLD) {
    // Eyes are likely closed
    return false;
  }

  // Calculate the average horizontal distance between inner and outer corners of the eyes
  const euclideanDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const leftEyeHorizontalDistance = euclideanDistance(leftEye[0], leftEye[3]);
  const rightEyeHorizontalDistance = euclideanDistance(rightEye[0], rightEye[3]);

  // Calculate the average distance from the eye center to the nose bridge (landmark 1)
  const leftEyeToNoseDistance = euclideanDistance(leftEye[0], { x: leftEye[0].x, y: leftEye[0].y });
  const rightEyeToNoseDistance = euclideanDistance(rightEye[0], { x: rightEye[0].x, y: rightEye[0].y });

  // Heuristic to determine if looking at the screen
  const lookingAtScreen = leftEyeToNoseDistance < leftEyeHorizontalDistance / 2 &&
                          rightEyeToNoseDistance < rightEyeHorizontalDistance / 2;

  return lookingAtScreen;
}
