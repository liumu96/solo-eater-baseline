// components/BackButton.tsx

import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation"; // 使用 next/navigation 模块中的 useRouter

const BackButton: React.FC<{ fontSize?: number }> = ({ fontSize = 24 }) => {
  const router = useRouter();

  return (
    <ArrowBackIcon
      onClick={() => router.back()}
      className="text-primary cursor-pointer"
      style={{ fontSize }}
    />
  );
};

export default BackButton;
