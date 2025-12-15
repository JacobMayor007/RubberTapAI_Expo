import { View } from "react-native";
import { Camera, useFrameProcessor } from "react-native-vision-camera";

export default function MeasureTwo() {
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find((d) => d.position === "back");

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const pixelData = frame.toArrayBuffer();
    const rgba = new Uint8Array(pixelData);
    console.log(`Pixel at 0,0: R(${rgba[0]}), G(${rgba[1]}), B(${rgba[2]})`);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Camera
        style={{ flexGrow: 1, width: 110.117 }}
        device={device!}
        isActive={true}
        frameProcessor={frameProcessor}
      />
    </View>
  );
}
