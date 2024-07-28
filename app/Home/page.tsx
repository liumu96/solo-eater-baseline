"use client";
import { Button } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { isValidYouTubeUrl } from "@/utils/validation";

const HomePage = () => {
  const router = useRouter();
  const webTitle = "Solo Eater";
  const [title, setTitle] = useState("");
  const { userInfo, setUserInfo, setVideoLink, videoLink } = useData();
  const [username, setUsername] = useState(userInfo.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [videoLinkError, setVideoLinkError] = useState("");

  useEffect(() => {
    const timerId = setInterval(() => {
      setTitle((prevTitle) => {
        const len = prevTitle.length;
        if (len < webTitle.length) {
          return webTitle.slice(0, len + 1);
        } else {
          clearInterval(timerId);
          return prevTitle;
        }
      });
    }, 200);
    return () => clearInterval(timerId);
  }, []);

  const handleStart = () => {
    let hasError = false;

    if (!isValidYouTubeUrl(videoLink)) {
      setVideoLinkError("Please enter a valid YouTube video link.");
      hasError = true;
    } else {
      setVideoLinkError("");
    }

    if (!username) {
      setUsernameError("Please enter your username.");
      hasError = true;
    } else {
      setUsernameError("");
    }

    if (!hasError) {
      window.localStorage.setItem("username", username);
      window.localStorage.setItem("videoLink", videoLink);
      setUserInfo({
        username,
      });
      router.push("/player");
    }
  };

  const updateUserName = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const updateVideoLink = (e: ChangeEvent<HTMLInputElement>) => {
    setVideoLink(e.target.value);
  };

  // const handleSurveyClick = () => {
  //   setSurveyTaken(true);
  //   setSurveyError("");
  //   window.open("https://forms.gle/eqXKZAf9qDVdzcgn9", "_blank");
  // };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="p-8 border shadow-lg rounded-lg w-full max-w-lg bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 min-w-[600px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          <span role="img" aria-label="wave" className="mr-2">
            👋
          </span>{" "}
          Welcome to {title}
        </h1>

        {/* <div className="mb-8 flex flex-col items-center w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Step 1</h2>
          <Button
            onClick={handleSurveyClick}
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            className="mt-4 max-w-xs"
          >
            Take Survey
          </Button>
          {surveyError && <p className="text-red-500 mt-2">{surveyError}</p>}
        </div> */}

        <div className="mb-8">
          {/* <h2 className="text-2xl font-bold mb-4 text-center">Step 2</h2> */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              Enter Your Participant ID
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={updateUserName}
              className="p-2 border border-gray-300 rounded mb-1 w-full bg-white"
            />
            {usernameError && (
              <p className="text-red-500 mt-1">{usernameError}</p>
            )}

            <label className="block text-lg font-semibold mb-2">
              Video Link
            </label>
            <input
              type="text"
              placeholder="Enter YouTube video link"
              className="p-2 border border-gray-300 rounded mb-1 w-full"
              value={videoLink}
              onChange={updateVideoLink}
            />
            {videoLinkError && (
              <p className="text-red-500 mt-1">{videoLinkError}</p>
            )}

            {/* <label className="block text-lg font-semibold mb-2">
              Eating Time / Minutes
            </label>
            <input
              type="text"
              placeholder="Input your eating time (minutes)"
              className="p-2 border border-gray-300 rounded mb-1 w-full"
              value={eatingTime}
              onChange={updateEatingTime}
            />
            {eatingTimeError && (
              <p className="text-red-500 mt-1">{eatingTimeError}</p>
            )} */}
          </div>
          <p className="mb-4">
            Once you start watching this video for this meal, you won’t be able
            to change it. Thanks for understanding!
          </p>
          <div className="flex justify-center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              className="max-w-xs"
              onClick={handleStart}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
