// utils/meshUtils.ts
import { Keypoint, MeshResult, Prediction } from "@/types/types"; // Adjust the path as necessary

function euclideanDistanceSum(x: Keypoint, points: Keypoint[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    let dx = x.x - points[i].x;
    let dy = x.y - points[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    sum += distance;
  }
  return sum / points.length;
}

export function calculateDirection(
  noseTip: Keypoint,
  leftNose: Keypoint,
  rightNose: Keypoint
): { yaw: number; turn: number; zDistance: number; xDistance: number } {
  const midpoint = {
    x: (leftNose.x + rightNose.x) / 2,
    y: (leftNose.y + rightNose.y) / 2,
    z: (leftNose.z !== undefined && rightNose.z !== undefined) ? (leftNose.z + rightNose.z) / 2 : undefined,
  };

  const perpendicularUp = { x: midpoint.x, y: midpoint.y - 50, z: midpoint.z };

  const yaw = getAngleBetweenLines(midpoint, noseTip, perpendicularUp);
  const turn = getAngleBetweenLines(midpoint, rightNose, noseTip);

  const zDistance = getDistanceBetweenPoints(noseTip, midpoint);
  const xDistance = getDistanceBetweenPoints(leftNose, rightNose);

  return { yaw, turn, zDistance, xDistance };
}

function getDistanceBetweenPoints(point1: Keypoint, point2: Keypoint): number {
  const xDistance = point1.x - point2.x;
  const yDistance = point1.y - point2.y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

function getAngleBetweenLines(midpoint: Keypoint, point1: Keypoint, point2: Keypoint): number {
  const vector1 = { x: point1.x - midpoint.x, y: point1.y - midpoint.y };
  const vector2 = { x: point2.x - midpoint.x, y: point2.y - midpoint.y };

  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  const cosineTheta = dotProduct / (magnitude1 * magnitude2);
  const angleInRadians = Math.acos(cosineTheta);
  return (angleInRadians * 180) / Math.PI;
}

export const getMesh = (predictions: Prediction[]): MeshResult => {
  let namedKeypoints: { [key: string]: Keypoint[] } | null = null;
  let leftEyePoint: Keypoint | null = null;
  let rightEyePoint: Keypoint | null = null;
  let noseTip: Keypoint | null = null;
  let leftNose: Keypoint | null = null;
  let rightNose: Keypoint | null = null;
  let euclideanDistance: { value: number; time: Date } | null = null;
  let yaw: number | null = null;
  let turn: number | null = null;

  if (predictions.length > 0) {
    const keypoints = predictions[0].keypoints;

    namedKeypoints = {};

    namedKeypoints["leftEye"] = keypoints.filter((obj) => obj.name === "leftEye");
    namedKeypoints["rightEye"] = keypoints.filter((obj) => obj.name === "rightEye");

    const faceOvalIndexes = [
      58, 172, 136, 150, 149, 176, 178, 148, 152, 377, 400, 378, 379, 365, 397,
      288, 381,
    ];
    namedKeypoints["faceOval"] = faceOvalIndexes.map((d) => keypoints[d]);

    noseTip = { ...keypoints[1], name: "nose tip" };
    leftNose = { ...keypoints[279], name: "left nose" };
    rightNose = { ...keypoints[49], name: "right nose" };

    namedKeypoints["noseTip"] = [noseTip];
    namedKeypoints["leftNose"] = [leftNose];
    namedKeypoints["rightNose"] = [rightNose];

    leftEyePoint = namedKeypoints["leftEye"][0];
    rightEyePoint = namedKeypoints["rightEye"][0];

    euclideanDistance = {
      value: euclideanDistanceSum(noseTip, namedKeypoints["faceOval"]),
      time: new Date(),
    };

    const direction = calculateDirection(noseTip, leftNose, rightNose);
    if (direction) {
      yaw = direction.yaw;
      turn = direction.turn;
    }
  }

  return {
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
};

export const drawOnCanvas = (
  ctx: CanvasRenderingContext2D | null,
  leftEyePoint: Keypoint | null,
  rightEyePoint: Keypoint | null,
  namedKeypoints: { [key: string]: Keypoint[] } | null
) => {
  if (ctx && namedKeypoints) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (leftEyePoint) {
      ctx.beginPath();
      ctx.arc(leftEyePoint.x, leftEyePoint.y, 1, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }

    if (rightEyePoint) {
      ctx.beginPath();
      ctx.arc(rightEyePoint.x, rightEyePoint.y, 1, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }

    if (namedKeypoints["faceOval"]) {
      namedKeypoints["faceOval"].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();

        if (leftEyePoint) {
          ctx.beginPath();
          ctx.moveTo(leftEyePoint.x, leftEyePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        if (rightEyePoint) {
          ctx.beginPath();
          ctx.moveTo(rightEyePoint.x, rightEyePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    }

    const nosePoints = ["noseTip", "leftNose", "rightNose"] as const;
    const noseColors: Record<typeof nosePoints[number], string> = {
      noseTip: "green",
      leftNose: "yellow",
      rightNose: "blue",
    };

    nosePoints.forEach((nosePoint) => {
      if (namedKeypoints[nosePoint]) {
        namedKeypoints[nosePoint].forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
          ctx.fillStyle = noseColors[nosePoint];
          ctx.fill();
        });
      }
    });
  }
};
