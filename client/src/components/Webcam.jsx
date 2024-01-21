import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSocket from "../hooks/socket";
import { extMap, sortAndFilterEmotions } from "../utils/emotionFilter";
import axios from "axios";

export default function WebcamVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const cap2 = useRef(false);
  const [webcam, setWebcam] = useState(false);
  const [maxEmotions, setMaxEmotions] = useState([]);
  const [showEmotions, setShowEmotions] = useState(false); // New state to control the display of emotions
  var chunks = [];

  const getFrame = useCallback(() => {
    if (webcamRef !== null && webcamRef.current !== null) {
      return webcamRef.current.getScreenshot();
    } else {
      return null;
    }
  }, [webcamRef]);

  const [emotions, setEmotions] = useState([]);

  const onEmotionUpdate = useCallback((newEmotions) => {
    if (newEmotions.length == 0) {
      return;
    }
    const n = sortAndFilterEmotions(newEmotions, 3);
    console.log("NNNN", n);
    setMaxEmotions(n);
  });
  const [socket, stopEverything, capturePhoto] = useSocket({
    getFrame,
    setEmotions,
    onEmotionUpdate,
    capturing: cap2,
  });

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    cap2.current = true;

    const stream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      sendVideoToServer(blob);
    };

    mediaRecorderRef.current.start();
  }, [webcamRef, mediaRecorderRef]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    cap2.current = false;
    if (chunks.length) {
      sendVideoToServer(chunks);
    }
  }, [mediaRecorderRef, setCapturing, chunks]);

  const handleDownload = useCallback(() => {
    if (chunks.length) {
      const blob = new Blob(chunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      chunks = [];
    }
  }, [chunks]);

  const sendVideoToServer = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("video", blob, "recorded-video.webm");

      const { data } = await axios.post(
        "http://localhost:3000/upload-video",
        formData
      );
      console.log(data);
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  const startRecording = () => {
    console.log("Starting recording");
    setCapturing(true);
    setShowEmotions(true);
    cap2.current = true;
    const stream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      sendVideoToServer(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    setShowEmotions(false);
    chunks = [];
    mediaRecorderRef.current.stop();
    setCapturing(false);
    cap2.current = false;
    setMaxEmotions([]);
  };

  const handleWebcam = () => {
    setWebcam(!webcam);
  };

  useEffect(() => {
    console.log("update capturing", capturing);

    if (capturing) {
      capturePhoto();
    }
  }, [capturing]);

  const videoConstraints = {
    facingMode: "user",
  };

  return (
    <div className="flex flex-col md:flex-row justify-center p-4 md:p-12 space-y-4 md:space-y-0 md:space-x-10">
      <div className="bg-light py-6 px-6 md:py-10 md:px-24 shadow-md rounded-md">
        <Webcam
          audio={true}
          muted={true}
          mirrored={true}
          ref={webcamRef}
          videoConstraints={videoConstraints}
          className="w-full md:max-w-lg self-center rounded-md"
        />
        <div className="mt-8">
          {capturing ? (
            <button
              className="btn bg-dark text-sm md:text-base"
              onClick={stopRecording}
            >
              Stop
            </button>
          ) : (
            <button
              className="btn bg-mid text-sm md:text-base"
              onClick={startRecording}
            >
              Practice
            </button>
          )}
          {chunks.length > 0 && (
            <button
              className="btn ml-2 text-sm md:text-base"
              onClick={handleDownload}
            >
              Download
            </button>
          )}
        </div>
      </div>
      {showEmotions ? (
        <div
          className={`flex flex-col text-left bg-light p-6 md:p-10 shadow-md rounded-md transition-opacity duration-500 ${
            showEmotions ? "opacity-100" : "opacity-0"
          }`}
        >
          <h4 className="font-bold text-base md:text-lg">Top Emotions List</h4>
          <div>
            {maxEmotions.map((e) => (
              <div
                key={e.name}
                className="bg-mid my-4 px-4 py-2 rounded-md flex justify-between"
              >
                <p className="text-sm md:text-base">{e.name}</p>
                <p className="text-sm md:text-base"> {e.score.toFixed(3)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
    </div>
  );
}
