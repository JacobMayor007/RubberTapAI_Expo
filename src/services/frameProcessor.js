import { useFrameProcessor } from "react-native-vision-camera";

const frameProcessor = useFrameProcessor((frame) => {
  "worklet";

  const pixelData = frame.toArrayBuffer(); // This is a conceptual representation
  const rgba = new Uint8Array(pixelData);
  console.log(`Pixel at 0,0: R(${rgba[0]}), G(${rgba[1]}), B(${rgba[2]})`);
}, []);

export default frameProcessor;
