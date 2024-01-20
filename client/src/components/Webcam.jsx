import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSocket from "../hooks/socket";
import axios from "axios";

const maxEmotions = [
  {
    name: "Admiration",
    score: 0.060718487948179245,
  },
  {
    name: "Adoration",
    score: 0.03393908217549324,
  },
  {
    name: "Aesthetic Appreciation",
    score: 0.05552653223276138,
  },
  {
    name: "Amusement",
    score: 0.05414880812168121,
  },
  {
    name: "Anger",
    score: 0.15331213176250458,
  },
  {
    name: "Anxiety",
    score: 0.17347106337547302,
  },
  {
    name: "Awe",
    score: 0.07149098813533783,
  },
  {
    name: "Awkwardness",
    score: 0.1764126420021057,
  },
  {
    name: "Boredom",
    score: 0.5634750127792358,
  },
  {
    name: "Calmness",
    score: 0.5557433366775513,
  },
  {
    name: "Concentration",
    score: 0.6846870183944702,
  },
  {
    name: "Contemplation",
    score: 0.25221189856529236,
  },
  {
    name: "Confusion",
    score: 0.4122934639453888,
  },
  {
    name: "Contempt",
    score: 0.20414546132087708,
  },
  {
    name: "Contentment",
    score: 0.0855766236782074,
  },
  {
    name: "Craving",
    score: 0.048967305570840836,
  },
  {
    name: "Determination",
    score: 0.20656701922416687,
  },
  {
    name: "Disappointment",
    score: 0.3314349353313446,
  },
  {
    name: "Disgust",
    score: 0.09056425094604492,
  },
  {
    name: "Distress",
    score: 0.18269085884094238,
  },
  {
    name: "Doubt",
    score: 0.35290002822875977,
  },
  {
    name: "Ecstasy",
    score: 0.01552280131727457,
  },
  {
    name: "Embarrassment",
    score: 0.0728725790977478,
  },
  {
    name: "Empathic Pain",
    score: 0.07914263755083084,
  },
  {
    name: "Entrancement",
    score: 0.1396426409482956,
  },
  {
    name: "Envy",
    score: 0.05593650043010712,
  },
  {
    name: "Excitement",
    score: 0.027454445138573647,
  },
  {
    name: "Fear",
    score: 0.08767421543598175,
  },
  {
    name: "Guilt",
    score: 0.08720698952674866,
  },
  {
    name: "Horror",
    score: 0.035128068178892136,
  },
  {
    name: "Interest",
    score: 0.2680805027484894,
  },
  {
    name: "Joy",
    score: 0.030008288100361824,
  },
  {
    name: "Love",
    score: 0.03561575710773468,
  },
  {
    name: "Nostalgia",
    score: 0.05582457408308983,
  },
  {
    name: "Pain",
    score: 0.08877305686473846,
  },
  {
    name: "Pride",
    score: 0.052432045340538025,
  },
  {
    name: "Realization",
    score: 0.1403522491455078,
  },
  {
    name: "Relief",
    score: 0.04244609922170639,
  },
  {
    name: "Romance",
    score: 0.023199284449219704,
  },
  {
    name: "Sadness",
    score: 0.2387680858373642,
  },
  {
    name: "Satisfaction",
    score: 0.05668972060084343,
  },
  {
    name: "Desire",
    score: 0.03643307834863663,
  },
  {
    name: "Shame",
    score: 0.06421031802892685,
  },
  {
    name: "Surprise (negative)",
    score: 0.05390920490026474,
  },
  {
    name: "Surprise (positive)",
    score: 0.03488391265273094,
  },
  {
    name: "Sympathy",
    score: 0.05737285688519478,
  },
  {
    name: "Tiredness",
    score: 0.2940036654472351,
  },
  {
    name: "Triumph",
    score: 0.018493130803108215,
  },
];
import axios from "axios";

const maxEmotions = [
  {
    name: "Admiration",
    score: 0.060718487948179245,
  },
  {
    name: "Adoration",
    score: 0.03393908217549324,
  },
  {
    name: "Aesthetic Appreciation",
    score: 0.05552653223276138,
  },
  {
    name: "Amusement",
    score: 0.05414880812168121,
  },
  {
    name: "Anger",
    score: 0.15331213176250458,
  },
  {
    name: "Anxiety",
    score: 0.17347106337547302,
  },
  {
    name: "Awe",
    score: 0.07149098813533783,
  },
  {
    name: "Awkwardness",
    score: 0.1764126420021057,
  },
  {
    name: "Boredom",
    score: 0.5634750127792358,
  },
  {
    name: "Calmness",
    score: 0.5557433366775513,
  },
  {
    name: "Concentration",
    score: 0.6846870183944702,
  },
  {
    name: "Contemplation",
    score: 0.25221189856529236,
  },
  {
    name: "Confusion",
    score: 0.4122934639453888,
  },
  {
    name: "Contempt",
    score: 0.20414546132087708,
  },
  {
    name: "Contentment",
    score: 0.0855766236782074,
  },
  {
    name: "Craving",
    score: 0.048967305570840836,
  },
  {
    name: "Determination",
    score: 0.20656701922416687,
  },
  {
    name: "Disappointment",
    score: 0.3314349353313446,
  },
  {
    name: "Disgust",
    score: 0.09056425094604492,
  },
  {
    name: "Distress",
    score: 0.18269085884094238,
  },
  {
    name: "Doubt",
    score: 0.35290002822875977,
  },
  {
    name: "Ecstasy",
    score: 0.01552280131727457,
  },
  {
    name: "Embarrassment",
    score: 0.0728725790977478,
  },
  {
    name: "Empathic Pain",
    score: 0.07914263755083084,
  },
  {
    name: "Entrancement",
    score: 0.1396426409482956,
  },
  {
    name: "Envy",
    score: 0.05593650043010712,
  },
  {
    name: "Excitement",
    score: 0.027454445138573647,
  },
  {
    name: "Fear",
    score: 0.08767421543598175,
  },
  {
    name: "Guilt",
    score: 0.08720698952674866,
  },
  {
    name: "Horror",
    score: 0.035128068178892136,
  },
  {
    name: "Interest",
    score: 0.2680805027484894,
  },
  {
    name: "Joy",
    score: 0.030008288100361824,
  },
  {
    name: "Love",
    score: 0.03561575710773468,
  },
  {
    name: "Nostalgia",
    score: 0.05582457408308983,
  },
  {
    name: "Pain",
    score: 0.08877305686473846,
  },
  {
    name: "Pride",
    score: 0.052432045340538025,
  },
  {
    name: "Realization",
    score: 0.1403522491455078,
  },
  {
    name: "Relief",
    score: 0.04244609922170639,
  },
  {
    name: "Romance",
    score: 0.023199284449219704,
  },
  {
    name: "Sadness",
    score: 0.2387680858373642,
  },
  {
    name: "Satisfaction",
    score: 0.05668972060084343,
  },
  {
    name: "Desire",
    score: 0.03643307834863663,
  },
  {
    name: "Shame",
    score: 0.06421031802892685,
  },
  {
    name: "Surprise (negative)",
    score: 0.05390920490026474,
  },
  {
    name: "Surprise (positive)",
    score: 0.03488391265273094,
  },
  {
    name: "Sympathy",
    score: 0.05737285688519478,
  },
  {
    name: "Tiredness",
    score: 0.2940036654472351,
  },
  {
    name: "Triumph",
    score: 0.018493130803108215,
  },
];

export default function WebcamVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const cap2 = useRef(false);
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

  // const [maxEmotions, setMaxEmotions] = useState([]);
  const onEmotionUpdate = useCallback((emotions) => {
    console.log("change emotions: ", emotions);
    if (emotions.length == 0) {
  // const [maxEmotions, setMaxEmotions] = useState([]);
  const onEmotionUpdate = useCallback((emotions) => {
    console.log("change emotions: ", emotions);
    if (emotions.length == 0) {
      return;
    }
    const n = sortAndFilterEmotions(newEmotions, 3);
    console.log("NNNN", n);
    setMaxEmotions(n);

    // setMinEmotions((m) => extMap(m, emotions, (a, b) => a < b));
    // setMaxEmotions((m) => extMap(m, emotions, (a, b) => a > b));
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
      formData.append("video", blob, "recorded-video.webm");

      const { data } = await axios.post(
        "http://localhost:3000/upload-video",
        formData
      );
      console.log(data);
    } catch (error) {
      console.error("Error uploading video:", error);
      console.error("Error uploading video:", error);
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
      const blob = new Blob(chunks, { type: "video/webm" });
      const blob = new Blob(chunks, { type: "video/webm" });
      sendVideoToServer(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    setCapturing(false);
    setCapturing(false);
    mediaRecorderRef.current.stop();
  };

  // const handleWebcam = () => {
  //   setWebcam(!webcam);
  // };
  // const handleWebcam = () => {
  //   setWebcam(!webcam);
  // };

  // useEffect(() => {
  //   if (webcam) {
  //     capturePhoto();
  //   }
  // }, [webcam]);
  // useEffect(() => {
  //   if (webcam) {
  //     capturePhoto();
  //   }
  // }, [webcam]);

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
        {/* <div className="mt-12">
        <button onClick={stopRecording}>Stop Recording</button>
        {/* <div className="mt-12">
          {capturing ? (
            <button className="btn bg-red-500" onClick={startRecording}>
            <button className="btn bg-red-500" onClick={startRecording}>
              Stop
            </button>
          ) : (
            <>
              <button
                className="btn bg-red-900"
                onClick={handleStartCaptureClick}
              >
              <button
                className="btn bg-red-900"
                onClick={handleStartCaptureClick}
              >
                Start
              </button>
            </>
          )}
          {chunks.length > 0 ? (
            <button className="btn ml-2" onClick={handleDownload}>
              Download
            </button>
          ) : null}
        </div> */}
        </div> */}
      </div>

      <div className="m-12 flex flex-col space-between">
        <h3 className="font-bold">Top Emotions List</h3>
        <div className="max-h-100 text-left">
          {maxEmotions.map((e) => (
            <div
              className="bg-red-900 px-4 py-2 min-w-24 my-4 rounded-lg flex justify-between items-center"
              key={e.name}
            >
              <p>{e.name}</p>
              <p>{e.score.toFixed(3)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
