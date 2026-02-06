// src/components/TreeMeasurementGuidance.tsx
import { AppText } from "@/src/components/AppText";
import { useTheme } from "@/src/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Accelerometer, AccelerometerMeasurement } from "expo-sensors";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, View } from "react-native";

/* -----------------------
   Types
----------------------- */
type DistanceState = "good" | "too_far" | "too_close";
type AngleState = "good" | "not_vertical" | "too_tilted";
type StabilityState = "good" | "shaking" | "unstable";
type FocusState = "good" | "not_focused" | "blurry";
type Overall = "good" | "warning" | "bad";

interface MeasurementGuidance {
  distance: DistanceState;
  angle: AngleState;
  stability: StabilityState;
  focus: FocusState;
  overallStatus: Overall;
}

interface GuidanceMessage {
  text: string;
  icon: string;
  color: string;
}

interface Props {
  isMeasuring: boolean;
  cameraRef?: any;
  setStatus: (disable: boolean) => void;
}

/* -----------------------
   Color maps
----------------------- */
const ANGLE_COLORS: Record<AngleState, string> = {
  good: "#10B981",
  not_vertical: "#FBBF24",
  too_tilted: "#EF4444",
};

const STABILITY_COLORS: Record<StabilityState, string> = {
  good: "#10B981",
  shaking: "#FBBF24",
  unstable: "#EF4444",
};

const FOCUS_COLORS: Record<FocusState, string> = {
  good: "#10B981",
  not_focused: "#FBBF24",
  blurry: "#EF4444",
};

const STATUS_COLORS: Record<Overall, string> = {
  good: "#10B981",
  warning: "#FBBF24",
  bad: "#EF4444",
};

/* -----------------------
   Helpers
----------------------- */
const computeOverallStatus = (
  angle: AngleState,
  stability: StabilityState,
  focus: FocusState
): Overall => {
  if (angle === "too_tilted" || stability === "unstable" || focus === "blurry")
    return "bad";
  if (
    angle === "not_vertical" ||
    stability === "shaking" ||
    focus === "not_focused"
  )
    return "warning";
  return "good";
};

const buildGuidanceMessage = (g: MeasurementGuidance): GuidanceMessage => {
  if (g.angle === "too_tilted")
    return {
      text: "📱 Hold phone vertically",
      icon: "phone-portrait",
      color: ANGLE_COLORS.too_tilted,
    };
  if (g.angle === "not_vertical")
    return {
      text: "📱 Adjust angle - keep vertical",
      icon: "phone-portrait",
      color: ANGLE_COLORS.not_vertical,
    };

  if (g.stability === "unstable")
    return {
      text: "🤝 Keep phone steady",
      icon: "hand-left",
      color: STABILITY_COLORS.unstable,
    };
  if (g.stability === "shaking")
    return {
      text: "🤝 Reduce movement",
      icon: "hand-left",
      color: STABILITY_COLORS.shaking,
    };

  if (g.focus === "blurry")
    return {
      text: "🔍 Image is blurry - move closer",
      icon: "close-circle",
      color: FOCUS_COLORS.blurry,
    };
  if (g.focus === "not_focused")
    return {
      text: "🔍 Focus on tree trunk",
      icon: "radio-button-off",
      color: FOCUS_COLORS.not_focused,
    };

  if (g.distance === "too_far")
    return {
      text: "📏 Move closer to tree",
      icon: "arrow-forward",
      color: STATUS_COLORS.bad,
    };
  if (g.distance === "too_close")
    return {
      text: "📏 Move back from tree",
      icon: "arrow-back",
      color: STATUS_COLORS.bad,
    };

  return {
    text: "✅ Perfect! Ready to measure",
    icon: "checkmark-circle",
    color: STATUS_COLORS.good,
  };
};

/* -----------------------
   Component
----------------------- */
const TreeMeasurementGuidance: React.FC<Props> = ({
  isMeasuring,
  cameraRef,
  setStatus,
}) => {
  const { theme } = useTheme();
  const [guidance, setGuidance] = useState<MeasurementGuidance>({
    distance: "good",
    angle: "good",
    stability: "good",
    focus: "good",
    overallStatus: "good",
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const accelBuffer = useRef<number[]>([]);
  const accelSubRef = useRef<{ remove?: () => void } | null>(null);

  /* -----------------------------
     Corrected orientation logic + console.log
  ----------------------------- */
  const analyzeDeviceOrientation = useCallback(
    (data: AccelerometerMeasurement) => {
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) || 1;
      const normX = data.x / magnitude;
      const normY = data.y / magnitude;
      const normZ = data.z / magnitude;

      let angle: AngleState = "good";

      /**
       * FIXED LOGIC:
       * normY ~ 0.97-1 → vertical (good)
       * normZ ~ 0.1-0.3 → slight forward/back tilt (good)
       * normX > 0.7 → sideways tilt (not_vertical)
       * normZ < 0.1 or > 0.9 → phone almost flat (too_tilted)
       */
      if (normZ < 0.1 || normZ > 0.3) {
        angle = "too_tilted";
      } else if (Math.abs(normX) > 0.7) {
        angle = "not_vertical";
      } else {
        angle = "good";
      }

      // Stability
      accelBuffer.current.push(magnitude);
      if (accelBuffer.current.length > 10) accelBuffer.current.shift();
      const avgAccel =
        accelBuffer.current.reduce((a, b) => a + b, 0) /
        accelBuffer.current.length;

      let stability: StabilityState = "good";
      if (avgAccel > 11) stability = "unstable";
      else if (avgAccel > 10.5) stability = "shaking";

      // Placeholder distance/focus
      let distance: DistanceState = "good";
      let focus: FocusState = "good";

      const overallStatus = computeOverallStatus(angle, stability, focus);

      setGuidance((prev) => {
        const changed =
          prev.angle !== angle ||
          prev.stability !== stability ||
          prev.distance !== distance ||
          prev.focus !== focus ||
          prev.overallStatus !== overallStatus;
        if (!changed) return prev;
        return { angle, stability, distance, focus, overallStatus };
      });
    },
    []
  );

  /* -----------------------
     Accelerometer subscription
  ----------------------- */
  useEffect(() => {
    if (!isMeasuring) {
      accelSubRef.current?.remove?.();
      accelSubRef.current = null;
      accelBuffer.current = [];
      return;
    }

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(analyzeDeviceOrientation);
    accelSubRef.current = sub;

    return () => {
      sub?.remove?.();
      accelSubRef.current = null;
      accelBuffer.current = [];
    };
  }, [isMeasuring, analyzeDeviceOrientation]);

  /* -----------------------
     Pulse animation
  ----------------------- */
  useEffect(() => {
    animationLoopRef.current = null;
    pulseAnim.stopAnimation();

    if (guidance.overallStatus !== "good") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animationLoopRef.current = loop;
      loop.start();
      setStatus(true);
    } else {
      pulseAnim.setValue(1);
      setStatus(false);
    }

    return () => {
      animationLoopRef.current?.stop?.();
      animationLoopRef.current = null;
    };
  }, [guidance.overallStatus, guidance]);

  const message = useMemo(() => buildGuidanceMessage(guidance), [guidance]);
  const statusColor = STATUS_COLORS[guidance.overallStatus];

  if (!isMeasuring) return null;

  return (
    <View className="absolute top-0 left-0 right-0 z-30 px-6 pt-4">
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }] }}
        className={`rounded-xl p-4 flex-row items-center gap-3 ${
          theme === "dark"
            ? "bg-black/70 border border-white/20"
            : "bg-white/90 border border-gray-300"
        }`}
      >
        <View
          className="h-12 w-12 rounded-full items-center justify-center"
          style={{ backgroundColor: statusColor }}
        >
          <Ionicons name={message.icon as any} size={24} color="white" />
        </View>

        <View className="flex-1">
          <AppText
            color={theme === "dark" ? "light" : "dark"}
            className="font-bold text-base"
          >
            {message.text}
          </AppText>

          <AppText
            color={theme === "dark" ? "light" : "dark"}
            className="text-xs opacity-70"
          >
            {guidance.overallStatus === "good"
              ? "Ready ✅"
              : guidance.overallStatus === "warning"
                ? "Adjust ⚠️"
                : "Incorrect ❌"}
          </AppText>
        </View>
      </Animated.View>

      <View className="flex-row gap-2 mt-4">
        <Indicator
          label="Angle"
          icon="phone-portrait"
          color={ANGLE_COLORS[guidance.angle]}
          status={guidance.angle === "good" ? "good" : "bad"}
          theme={theme}
        />
        <Indicator
          label="Stable"
          icon="hand-left"
          color={STABILITY_COLORS[guidance.stability]}
          status={guidance.stability === "good" ? "good" : "bad"}
          theme={theme}
        />
        <Indicator
          label="Focus"
          icon="search"
          color={FOCUS_COLORS[guidance.focus]}
          status={guidance.focus === "good" ? "good" : "bad"}
          theme={theme}
        />
      </View>
    </View>
  );
};

/* -----------------------
   Indicator Component
----------------------- */
const Indicator: React.FC<{
  label: string;
  icon: any;
  color: string;
  theme: string;
  status: "good" | "bad";
}> = ({ label, icon, color, theme, status }) => {
  return (
    <View
      className={`flex-1 p-3 rounded-lg items-center ${
        theme === "dark" ? "bg-black/70" : "bg-white/90"
      }`}
    >
      <Ionicons name={icon} size={20} color={color} />
      <AppText
        color={theme === "dark" ? "light" : "dark"}
        className="text-xs mt-1 text-center font-semibold"
      >
        {label} {status === "good" ? "✓" : "✗"}
      </AppText>
    </View>
  );
};

export default TreeMeasurementGuidance;
