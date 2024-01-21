import React, { useEffect, useRef, useState } from "react";
import VideoControls from "./VideoControls";

const VideoPlayer = ({ src, startTimestamp }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTimestamp);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleScrub = (value) => {
    setCurrentTime(value);
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTimestamp;
      videoRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(videoRef.current.currentTime);
      });
      videoRef.current.addEventListener("loadedmetadata", () => {
        setDuration(videoRef.current.duration);
      });
    }
  }, [startTimestamp]);

  const onLoadedMetadata = () => {
    const duration = videoRef.current.duration;
    console.log("Loaded metadata:", duration);
    setDuration(duration);
  };

  const onTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    setCurrentTime(currentTime);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = startTimestamp;
      videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.addEventListener("timeupdate", onTimeUpdate);

      // Cleanup listeners on unmount
      return () => {
        videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        videoElement.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [startTimestamp]);

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        type="video/webm"
        controls={false}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>
      <VideoControls
        playing={playing}
        onPlayPause={togglePlayPause}
        onScrub={handleScrub}
        duration={duration}
        currentTime={currentTime}
      />
    </div>
  );
};

export default VideoPlayer;
