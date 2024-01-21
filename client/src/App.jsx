import "./App.css";
import Navbar from "./components/Navbar";
import VideoPlayer from "./components/VideoPlayer";
import WebcamVideo from "./components/Webcam";

function App() {
  const videoSrc = "./src/assets/T-Pain.mp4";
  return (
    <>
      <div className="dotted-background">
        <Navbar />
        <WebcamVideo />
        {/* <div className="flex justify-center mx-auto" style={{ width: "50%" }}>
          <VideoPlayer src={videoSrc} startTimestamp={2.8} />
        </div> */}
      </div>
      <script src="webgazer.js" type="text/javascript" />
    </>
  );
}

export default App;
