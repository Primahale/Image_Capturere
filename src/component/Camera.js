import React, {useEffect, useRef, useState} from 'react';

const Camera = ({onCapture})=>{
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('user');
    const [zoom, setZoom] = useState(1);
    const [zoomRange, setZoomRange] = useState({ min: 1, max: 3 }); 
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [isBlinking, setIsBlinking] = useState(false);
    // const [videoDimensions, setVideoDimensions] = useState({ width: 1280, height: 720 });

    const checkCameras = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const hasBackCamera = videoDevices.some(device => device.facing === 'environment');
    
          setFacingMode(hasBackCamera ? 'environment' : 'user');
        } catch (error) {
          console.log('Error checking camera devices:', error);
        }
      };
    
      useEffect(() => {
        checkCameras();
      }, []);

    useEffect(() => {
        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, [stream]);
    
    const startCamera = async()=>{
        if(stream) return;
    
       const constraints = {
        video:{
            facingMode,
            width : {ideal : 1280},
            height : {ideal : 720},
        }
       };

       try{
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setIsCameraOn(true);
        // await applyZoom(mediaStream, zoom);
       }
       catch(error){
        console.log("Error to Accessing a Camera", error);
       }
    };


    const stopCamera = ()=>{
        if(stream){
            stream.getTracks().forEach(track=> track.stop());
            setStream(null);
            setIsCameraOn(false);
        }
    }

    const calculateHeight = () => {
        switch (aspectRatio) {
          case '16:9':
            return 700;
          case '4:3':
            return 860;
          case '1:1':
            return 1200;
          default:
            return 700;
        }
      };

    const applyZoom = (zoomLevel) => {
        if (stream) {
          const videoTrack = stream.getVideoTracks()[0];
          const capabilities = videoTrack.getCapabilities();
          const zoomCap = capabilities?.zoom || { min: 1, max: 3 };
    
          const newZoom = Math.min(Math.max(zoomLevel, zoomCap.min), zoomCap.max);
          setZoom(newZoom);
    
          videoTrack.applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        }
      };
    

      const handleZoomChange = async (e) => {
        const newZoom = parseFloat(e.target.value);
        setZoom(newZoom);
        if (stream) {
          applyZoom(newZoom);
        }
        // if (videoRef.current) {
        //     videoRef.current.style.transform = `scale(${newZoom})`;
        //   } 
          if (videoRef.current) {
            videoRef.current.style.transform = `scale(${newZoom})`;
            videoRef.current.style.transformOrigin = 'center center'; // Optional: Ensure zoom is centered
            videoRef.current.style.transform = `scale(${newZoom})`;
            
            videoRef.current.style.transform = `scaleX(-1) scale(${newZoom})`;
        } 
      };

    const handleCapture = () => {
        setIsBlinking(true);
      
        const context = canvasRef.current.getContext('2d');
        const video = videoRef.current;
      
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
      
        // const scaledWidth = videoWidth / zoom;
        // const scaledHeight = videoHeight / zoom;
        // const startX = (videoWidth - scaledWidth) / 2;
        // const startY = (videoHeight - scaledHeight) / 2;
      
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const scaledWidth = videoWidth * zoom;
        const scaledHeight = videoHeight * zoom;
        
        // if (facingMode === 'user') {
        //     context.translate(canvasWidth, 0);
        //     context.scale(-1, 1);
        //   }

        const startX = (canvasWidth - scaledWidth) / 2;
        const startY = (canvasHeight - scaledHeight) / 2;

        context.drawImage(video, 0, 0, videoWidth, videoHeight, startX, startY, scaledWidth, scaledHeight);
      
        // context.drawImage(
        //   video,
        //   startX, startY,               
        //   scaledWidth, scaledHeight,   
        //   0, 0,                        
        //   canvasWidth, canvasHeight     
        // );
    
        const imageData = canvasRef.current.toDataURL('image/png');
        onCapture(imageData);
      
        setTimeout(() => {
          setIsBlinking(false);
        }, 500);
      };

       useEffect(() => {
        if (videoRef.current && stream) {
          const videoTrack = stream.getVideoTracks()[0];
          const capabilities = videoTrack.getCapabilities();
          const zoomCap = capabilities?.zoom || { min: 1, max: 3 };
    
          setZoomRange({ min: zoomCap.min || 1, max: zoomCap.max || 3 });
        }
      }, [stream]);

    const switchCamera =async ()=>{
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        
          // Start a new camera stream with the updated facingMode
          const constraints = {
            video: {
              facingMode: newFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          };
        
          try {
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
          } catch (error) {
            console.error('Error switching camera:', error);
          }
    };

  

    const handleAspectRatioChange = (e)=>{
        const newAspectRatio = e.target.value;
        setAspectRatio(newAspectRatio);
        // calculateHeight(newAspectRatio)
    }

    // useEffect(() => {
    //     calculateHeight(aspectRatio);
    //   }, [aspectRatio]);

  
    useEffect(() => {
        if (videoRef.current) {
          const { width } = videoRef.current.getBoundingClientRect();
          const heightMap = {
            '16:9': width * (9 / 16),
            '4:3': width * (3 / 4),
            '1:1': width,
          };
          videoRef.current.style.width = `${width}px`;
          videoRef.current.style.height = `${heightMap[aspectRatio]}px`;
          
          canvasRef.current.width = width;
          canvasRef.current.height = heightMap[aspectRatio];
        }
      }, [aspectRatio]);


    return(
        <div className="camera-container">
      {!isCameraOn ? (
        <button onClick={startCamera} className="start-btn"><img src='https://img.icons8.com/?size=100&id=60708&format=png&color=000000'></img></button>
      ) : (
        <div className="video-wrapper" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ transform: `${facingMode === 'user' ? 'scaleX(-1)': 'scaleX(1)'} `,
            width: '100%',
            // height: '100%',
            aspectRatio,
            objectFit: 'contain'
        }}
            className={isBlinking ? 'blink' : ''}
          ></video>

        <button className="stop-btn" onClick={stopCamera} data-tooltip="Stop Camera">
            <img src="https://img.icons8.com/?size=50&id=6483&format=png&color=000000" alt="Stop" />
        </button>
                
         
          <div className="controls">
          <button onClick={switchCamera} data-tooltip="Switch Camera"><img src='https://img.icons8.com/?size=30&id=2211&format=png&color=000000'></img></button>
            <button onClick={handleCapture} data-tooltip="Capture Photo"><img src='https://img.icons8.com/?size=30&id=123926&format=png&color=000000'></img></button>
            {/* <button onClick={stopCamera} data-tooltip="Stop Camera"><img src='https://img.icons8.com/?size=30&id=rIlhCoOzIUwg&format=png&color=000000'></img></button> */}
            <input
              type="range"
              min={zoomRange.min}
              max={zoomRange.max}
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              data-tooltip="zoom"
            />
            <select onChange={handleAspectRatioChange} value={aspectRatio}>
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </select>
         
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width="640" height="480"  style={{ display: 'none' }}></canvas>
    </div>
    )
}

export default Camera;
