import React from "react";

const Resizer: React.FC<{ onResize: (clientY: number) => void }> = ({
  onResize,
}) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const onMouseMove = (e: MouseEvent) => {
      onResize(e.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="w-full h-2 bg-gray-500 cursor-row-resize"
    />
  );
};

export default Resizer;
