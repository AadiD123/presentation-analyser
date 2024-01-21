import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSocket from "../hooks/socket";
import { extMap, sortAndFilterEmotions } from "../utils/emotionFilter";
import axios from 'axios';

export default function WebcamVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const cap2 = useRef(false)
  const [webcam, setWebcam] = useState(false);
  var chunks = [];


  const getFrame = useCallback(() => {
    if (webcamRef !== null && webcamRef.current !== null) {
      return webcamRef.current.getScreenshot();
    } else {
      return null;
    }
  }, [webcamRef]);

  const [emotions, setEmotions] = useState([]);

  const [maxEmotions, setMaxEmotions] = useState([]);
  const onEmotionUpdate = useCallback((newEmotions) => {
    if (newEmotions.length == 0) {
      return;
    }
    const n = sortAndFilterEmotions(newEmotions, 3)
    console.log("NNNN", n)
    setMaxEmotions(n)

  });
  const [socket, stopEverything, capturePhoto] = useSocket({
    getFrame,
    setEmotions,
    onEmotionUpdate,
    capturing: cap2
  });

  

  const handleStartCaptureClick = useCallback(() => {

    setCapturing(true);
    cap2.current = true

    const stream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      sendVideoToServer(blob);
    };

    mediaRecorderRef.current.start();
  }, [webcamRef, mediaRecorderRef]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    cap2.current = false
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
      formData.append('video', blob, 'recorded-video.webm');
      
      const {data} = await axios.post('http://localhost:3000/upload-video', formData);
      console.log(data);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const startRecording = () => {
    console.log("Starting recording");
    const stream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      sendVideoToServer(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    chunks = [];
    mediaRecorderRef.current.stop();
  };


  const handleWebcam = () => {
    setWebcam(!webcam);
  };

  useEffect(() => {
    console.log("update capturing", capturing)

    if (capturing) {
      capturePhoto();
    }
  }, [capturing]);

  const videoConstraints = {
    facingMode: "user",
  };

  return (
    <div className="flex justify-center">
      {/* <button className="btn" onClick={handleWebcam}>
        X
      </button>
      {webcam ? ( // Check if webcam is enabled
        
      ) : null} */}
      <div>
        <Webcam
          audio={true}
          muted={true}
          mirrored={true}
          ref={webcamRef}
          videoConstraints={videoConstraints}
          className="max-w-lg self-center mt-10 rounded-md"
        />
        <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
        <div className="mt-12">
          {capturing ? (
            <button className="btn bg-red-500" onClick={handleStopCaptureClick}>
              Stop
            </button>
          ) : (
            <>
              <button className="btn" onClick={handleStartCaptureClick}>
                Start
              </button>
            </>
          )}
          {chunks.length > 0 ? (
            <button className="btn ml-2" onClick={handleDownload}>
              Download
            </button>
          ) : null}
        </div>
      </div>

      <div className="m-12 flex flex-col justify-center">
        <div>
          {maxEmotions
            .map((e) => (
              <div key={e.name}>
                <p>
                  {e.name} {e.score.toFixed(3)}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
