"use client";

import { useData } from "@/context/DataContext";
import React, { useEffect, useRef } from "react";
import { Button, Typography } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const UserDataPage = () => {
  const { userInfo, videoLink, videoPlayInfo, userBehaviorInfo } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log(userInfo, userBehaviorInfo);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const testUserInfo = {
    participantID: userInfo.username,
    videoLink: videoLink,
    videoWatchingDuration: {
      open: videoPlayInfo?.startTime || new Date(),
      close: videoPlayInfo?.stopTime || new Date(),
      stopTimes: (videoPlayInfo?.pauseTimes || []).map(
        (time) => new Date(time)
      ),
      resumeTimes: (videoPlayInfo?.resumeTimes || []).map(
        (time) => new Date(time)
      ),
    },
    chewingDuration: {
      stopTimes: (userBehaviorInfo?.stopChewingTimes || []).map(
        (time) => new Date(time)
      ),
      resumeTimes: (userBehaviorInfo?.resumeChewingTimes || []).map(
        (time) => new Date(time)
      ),
    },
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      html2canvas(canvas)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF();
          const imgWidth = 210; // A4 size width in mm
          const pageHeight = 297; // A4 size height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save("user_info.pdf");
        })
        .catch((err) => {
          console.error("Error generating PDF:", err);
        });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set font for text
        ctx.font = "16px Arial";

        // Draw text information
        let y = 30;
        ctx.fillText(`Participant ID: ${testUserInfo.participantID}`, 10, y);
        y += 24;
        ctx.fillText(`Video Link: ${testUserInfo.videoLink}`, 10, y);
        y += 24;

        ctx.fillText(`Video Watching Duration:`, 10, y);
        y += 24;
        ctx.fillText(
          `- Open: ${formatDate(testUserInfo.videoWatchingDuration.open)}`,
          20,
          y
        );
        y += 24;
        ctx.fillText(
          `- Close: ${formatDate(testUserInfo.videoWatchingDuration.close)}`,
          20,
          y
        );
        y += 24;

        // Draw table for video watching
        const tableX = 10;
        const tableY = y;
        const rowHeight = 24;
        const colWidth = 300;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        // Table headers
        ctx.strokeRect(tableX, tableY, colWidth, rowHeight);
        ctx.strokeRect(tableX + colWidth, tableY, colWidth, rowHeight);
        ctx.fillText("Stop Times", tableX + 10, tableY + 16);
        ctx.fillText("Resume Times", tableX + colWidth + 10, tableY + 16);

        // Table data for video watching
        for (
          let i = 0;
          i < testUserInfo.videoWatchingDuration.stopTimes.length;
          i++
        ) {
          ctx.strokeRect(
            tableX,
            tableY + (i + 1) * rowHeight,
            colWidth,
            rowHeight
          );
          if (i < testUserInfo.videoWatchingDuration.resumeTimes.length) {
            ctx.strokeRect(
              tableX + colWidth,
              tableY + (i + 1) * rowHeight,
              colWidth,
              rowHeight
            );
          }
          ctx.fillText(
            formatDate(testUserInfo.videoWatchingDuration.stopTimes[i]),
            tableX + 10,
            tableY + (i + 1) * rowHeight + 16
          );
          if (i < testUserInfo.videoWatchingDuration.resumeTimes.length) {
            ctx.fillText(
              formatDate(testUserInfo.videoWatchingDuration.resumeTimes[i]),
              tableX + colWidth + 10,
              tableY + (i + 1) * rowHeight + 16
            );
          }
        }

        // Move down for chewing information
        y =
          tableY +
          (testUserInfo.videoWatchingDuration.stopTimes.length + 2) *
            rowHeight +
          30;
        ctx.fillText(`Chewing Duration:`, 10, y);
        y += 24;

        // Draw table for chewing
        ctx.strokeRect(tableX, y, colWidth, rowHeight);
        ctx.strokeRect(tableX + colWidth, y, colWidth, rowHeight);
        ctx.fillText("Stop Times", tableX + 10, y + 16);
        ctx.fillText("Resume Times", tableX + colWidth + 10, y + 16);

        // Table data for chewing
        for (
          let i = 0;
          i < testUserInfo.chewingDuration.stopTimes.length;
          i++
        ) {
          ctx.strokeRect(tableX, y + (i + 1) * rowHeight, colWidth, rowHeight);
          if (i < testUserInfo.chewingDuration.resumeTimes.length) {
            ctx.strokeRect(
              tableX + colWidth,
              y + (i + 1) * rowHeight,
              colWidth,
              rowHeight
            );
          }
          ctx.fillText(
            formatDate(testUserInfo.chewingDuration.stopTimes[i]),
            tableX + 10,
            y + (i + 1) * rowHeight + 16
          );
          if (i < testUserInfo.chewingDuration.resumeTimes.length) {
            ctx.fillText(
              formatDate(testUserInfo.chewingDuration.resumeTimes[i]),
              tableX + colWidth + 10,
              y + (i + 1) * rowHeight + 16
            );
          }
        }
      }
    }
  }, [testUserInfo]);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <Typography variant="h4" align="center" gutterBottom>
        🎉 Thank you for watching! 🎉
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        The viewing session has ended. Please complete our survey.
        <br />
        Your feedback is very important to us! ❤️
      </Typography>
      <Typography variant="h5" align="center" gutterBottom>
        Step 1: Download the PDF
      </Typography>
      <Button
        onClick={downloadPDF}
        variant="contained"
        color="primary"
        size="large"
        className="mt-8"
      >
        Download PDF
      </Button>
      <Typography variant="h5" align="center" gutterBottom>
        Step 2: Complete the Survey
      </Typography>
      <Button
        onClick={() => {
          window.open(
            "https://docs.google.com/forms/d/e/1FAIpQLSdEEvlF6_PNWP6SmAe68uRRoS7vPWrAHX8dkbKqvumvgscjHw/viewform?usp=sf_link",
            "_blank"
          );
        }}
        variant="contained"
        color="secondary"
        size="large"
        className="mt-8"
      >
        Go to Survey
      </Button>
      <canvas
        ref={canvasRef}
        width={800} // Increase width to ensure the chart is not cut off
        height={700} // Adjust height to fit all content
        className="border"
      ></canvas>
    </div>
  );
};

export default UserDataPage;
