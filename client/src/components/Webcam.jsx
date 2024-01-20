import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSocket from "../hooks/socket";

export default function WebcamVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const getFrame = useCallback (async () => {
    return webcamRef.current.getScreenshot();
  }, [webcamRef]);

  const [emotions, setEmotions] = useState([])
  const [socket, stopEverything] = useSocket({getFrame, setEmotions})
  const [maxEmotions, setMaxEmotions] = useState([])
  useEffect(() => {
    console.log("change emotions: ", emotions)
  }, [emotions])

  useEffect(() => {
    return () => {
      // stopEverything()
    }
  }, [])

  function extMap(oldMins, newEmotions, compare) {
    if (oldMins.length == 0) return newEmotions;
    const newMinEmotions = [];
    for (let i = 0; i < newEmotions.length; i++) {
      const newEmotion = newEmotions[i];
      for (let j = 0; j < newEmotions.length; j++) {
        const oldMin = oldMins[j];
        if (oldMin.name == newEmotion.name) {
          newMinEmotions.push(compare(newEmotion.score, oldMin.score) ? newEmotion : oldMin);
        }
      }
    }
    return newMinEmotions;
  }

  useEffect(() => {
    if (emotions.length == 0) {
      return;
    }

    // setMinEmotions((m) => extMap(m, emotions, (a, b) => a < b));
    setMaxEmotions((m) => extMap(m, emotions, (a, b) => a > b));
  },[emotions])

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    if (recordedChunks.length) {
      console.log("Chunks before sending:", recordedChunks); // Add this line
      sendVideoToServer(recordedChunks);
    } else {
      console.log("No chunks to send"); // Add this line
    }
  }, [mediaRecorderRef, setCapturing, recordedChunks]);

  // const handleDownload = useCallback(() => {
  //   if (recordedChunks.length) {
  //     const blob = new Blob(recordedChunks, {
  //       type: "video/webm",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     document.body.appendChild(a);
  //     a.style = "display: none";
  //     a.href = url;
  //     a.download = "react-webcam-stream-capture.webm";
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     setRecordedChunks([]);
  //   }
  // }, [recordedChunks]);

  const sendVideoToServer = async (videoChunks) => {
    const blob = new Blob(videoChunks, { type: "video/webm" });
    console.log("Sending video to server", blob);

    let formData = new FormData();
    formData.append("video", videoBlob, "videoFileName.mp4");

    try {
      console.log("sending");
      await fetch("http://localhost:3000/api/video", {
        method: "POST",
        body: blob,
      });
    } catch (error) {
      console.error("Error sending video to server:", error);
    }
  };



  const videoConstraints = {
    facingMode: "user",
  };

  return (
    <div>
      <Webcam
        audio={false}
        mirrored={true}
        ref={webcamRef}
        videoConstraints={videoConstraints}
        style={{ margin: "0px" }}
      />
      <div className="mt-12">
        {capturing ? (
          <button className="btn" onClick={handleStopCaptureClick}>
            Stop
          </button>
        ) : (
          <>
          <button className="btn" onClick={handleStartCaptureClick}>
            Analyze Presentation
          </button>
          <div>
            {maxEmotions.map(e => (<div key={e.name}>
              <p>{e.name + " " + e.score}</p>
            </div>))}
          </div>
          </>
        )}
        {/* {recordedChunks.length > 0 && (
          <button className="btn ml-2" onClick={handleDownload}>
            Download
          </button>
        )} */}
      </div>
    </div>
  );
}
