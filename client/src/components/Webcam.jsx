import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSocket from "../hooks/socket";

export default function WebcamVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [webcam, setWebcam] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const getFrame = useCallback(() => {
    if (webcamRef !== null && webcamRef.current !== null) {
      return webcamRef.current.getScreenshot();
    } else {
      return null;
    }
  }, [webcamRef]);

  const [emotions, setEmotions] = useState([]);

  const [maxEmotions, setMaxEmotions] = useState([]);
  const onEmotionUpdate = useCallback((emotions) => {
    console.log("change emotions: ", emotions);
    if (emotions.length == 0) {
      return;
    }

    // setMinEmotions((m) => extMap(m, emotions, (a, b) => a < b));
    setMaxEmotions((m) => extMap(m, emotions, (a, b) => a > b));
  });
  const [socket, stopEverything, capturePhoto] = useSocket({
    getFrame,
    setEmotions,
    onEmotionUpdate,
  });

  function extMap(oldMins, newEmotions, compare) {
    if (oldMins.length == 0) return newEmotions;
    const newMinEmotions = [];
    for (let i = 0; i < newEmotions.length; i++) {
      const newEmotion = newEmotions[i];
      for (let j = 0; j < newEmotions.length; j++) {
        const oldMin = oldMins[j];
        if (oldMin.name == newEmotion.name) {
          newMinEmotions.push(
            compare(newEmotion.score, oldMin.score) ? newEmotion : oldMin
          );
        }
      }
    }
    return newMinEmotions;
  }

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
      sendVideoToServer(recordedChunks);
    }
  }, [mediaRecorderRef, setCapturing, recordedChunks]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
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
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      await axios.post('http://localhost:3000/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error.message);
    }
  };


  const handleWebcam = () => {
    setWebcam(!webcam);
  };

  useEffect(() => {
    if (webcam) {
      capturePhoto();
    }
  }, [webcam]);

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
          {recordedChunks.length > 0 ? (
            <button className="btn ml-2" onClick={handleDownload}>
              Download
            </button>
          ) : null}
        </div>
      </div>

      <div className="m-12 flex flex-col justify-center">
        <div>
          {maxEmotions
            .slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => b.score - a.score) // Sort in descending order by score
            .slice(0, 3) // Limit to the top 3 elements
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
