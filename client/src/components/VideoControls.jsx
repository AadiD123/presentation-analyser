import React from "react";

const VideoControls = ({
  playing,
  onPlayPause,
  onScrub,
  duration,
  currentTime,
}) => {
  const styles = {
    controlsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "10px",
    },
    playPauseButton: {
      cursor: "pointer",
      fontSize: "16px",
      padding: "10px 20px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      marginBottom: "10px",
    },
    scrubber: {
      width: "100%",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.controlsContainer}>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={(e) => onScrub(e.target.value)}
        style={styles.scrubber}
      />
      <button style={styles.playPauseButton} onClick={onPlayPause}>
        {playing ? "⏸ Pause" : "▶ Play"}
      </button>
    </div>
  );
};

export default VideoControls;
