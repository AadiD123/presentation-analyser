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

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        type="video/mp4"
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
