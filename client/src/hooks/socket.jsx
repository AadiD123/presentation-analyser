import React, { useState, useRef, useEffect } from "react";

export default function useSocket({getFrame, setEmotions}) {
    const socketRef = useRef(null)
    const mountRef = useRef(true);
    const numReconnects = useRef(0)
    const maxReconnects = 3

    useEffect(() => {
        console.log("Mounting component");
        mountRef.current = true;
        console.log("Connecting to server");
        connect();
    
        return () => {
          console.log("Tearing down component");
          stopEverything();
        };
      }, [mountRef]);

      function connect() {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log("Socket already exists, will not create");
        } else {
          const endpointUrl = `wss://api.hume.ai/v0/stream/models`;
          const socketUrl = `${endpointUrl}?apikey=${`A8GpCQIbPM64uRNFubcDOwIJq7CPGUOZFG9tx3wcirKOtKIh`}`;
          console.log(`Connecting to websocket... (using ${endpointUrl})`);
        //   setStatus(`Connecting to server...`);
    
          const socket = new WebSocket(socketUrl);
    
          socket.onopen = socketOnOpen;
          socket.onmessage = socketOnMessage;
          socket.onclose = socketOnClose;
          socket.onerror = socketOnError;
    
          socketRef.current = socket;
        }
      }
      async function socketOnOpen() {
        console.log("Connected to websocket");
        // setStatus("Connecting to webcam...");
        // if (recorderRef.current) {
        //   console.log("Video recorder found, will use open socket");
        //   await capturePhoto();
        // } else {
        //   console.warn("No video recorder exists yet to use with the open socket");
        // }
        await capturePhoto()
      }
    
      async function socketOnMessage(event) {
        // setStatus("");
        const response = JSON.parse(event.data);
        console.log("Got response", response);
        const predictions = response.face?.predictions || [];
        const warning = response.face?.warning || "";
        const error = response.error;
        if (error) {
        //   setStatus(error);
          console.error(error);
          stopEverything();
          return;
        }
    
        if (predictions.length === 0) {
        //   setStatus(warning.replace(".", ""));
          setEmotions([]);
        }
    
        const newTrackedFaces = [];
        predictions.forEach(async (pred, dataIndex) => {
          newTrackedFaces.push({ boundingBox: pred.bbox });
          if (dataIndex === 0) {
            const newEmotions = pred.emotions;
            setEmotions(newEmotions);
            // if (onCalibrate) {
            //   onCalibrate(newEmotions);
            // }
          }
        });
        // setTrackedFaces(newTrackedFaces);
    
        await capturePhoto();
      }
    
      async function socketOnClose(event) {
        console.log("Socket closed");
    
        if (mountRef.current === true) {
        //   setStatus("Reconnecting");
          console.log("Component still mounted, will reconnect...");
          connect();
        } else {
          console.log("Component unmounted, will not reconnect...");
        }
      }
    
      async function socketOnError(event) {
        console.error("Socket failed to connect: ", event);
        if (numReconnects.current >= maxReconnects) {
        //   setStatus(`Failed to connect to the Hume API (${authContext.environment}).
        //   Please log out and verify that your API key is correct.`);
          stopEverything();
        } else {
          numReconnects.current++;
          console.warn(`Connection attempt ${numReconnects.current}`);
        }
      }
    
      function stopEverything() {
        console.log("Stopping everything...");
        mountRef.current = false;
        const socket = socketRef.current;
        if (socket) {
          console.log("Closing socket");
          socket.close();
          socketRef.current = null;
        } else {
          console.warn("Could not close socket, not initialized yet");
        }
        // const recorder = recorderRef.current;
        // if (recorder) {
        //   console.log("Stopping recorder");
        //   recorder.stopRecording();
        //   recorderRef.current = null;
        // } else {
        //   console.warn("Could not stop recorder, not initialized yet");
        // }
      }
    
    //   async function onVideoReady(videoElement) {
    //     console.log("Video element is ready");
    
    //     if (!photoRef.current) {
    //       console.error("No photo element found");
    //       return;
    //     }
    
    //     if (!recorderRef.current && recorderCreated.current === false) {
    //       console.log("No recorder yet, creating one now");
    //       recorderCreated.current = true;
    //       const recorder = await VideoRecorder.create(videoElement, photoRef.current);
    
    //       recorderRef.current = recorder;
    //       const socket = socketRef.current;
    //       if (socket && socket.readyState === WebSocket.OPEN) {
    //         console.log("Socket open, will use the new recorder");
    //         await capturePhoto();
    //       } else {
    //         console.warn("No socket available for sending photos");
    //       }
    //     }
    //   }
    
      async function capturePhoto() {
        // const recorder = recorderRef.current;
    
        // if (!recorder) {
        //   console.error("No recorder found");
        //   return;
        // }
    
        // const photoBlob = await recorder.takePhoto();
        const photoBlob = await getFrame()
        sendRequest(photoBlob);
      }
    
      async function sendRequest(photoBlob) {
        const socket = socketRef.current;
    
        if (!socket) {
          console.error("No socket found");
          return;
        }

        // const blob = b64toBlob(photoBlob)
        const blob = await fetch(photoBlob)
        .then(res => res.blob())
    
        const encodedBlob = await blobToBase64(blob);
        // console.log("photo blob", encodedBlob)
        const requestData = JSON.stringify({
          data: encodedBlob,
          models: {
            face: {},
          },
        });
    
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(requestData);
        } else {
          console.error("Socket connection not open. Will not capture a photo");
          socket.close();
        }
      }

      const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
          
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }

      function blobToBase64(blob) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              const result = reader.result;
              resolve(result.split(",")[1]);
            }
          };
          reader.readAsDataURL(blob);
        });
      }

      return [socketRef, stopEverything]
}