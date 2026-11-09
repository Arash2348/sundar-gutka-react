// Autopilot's on/off switch for the Reader: everything the Reader needs from Autopilot in one hook,
// so the Reader itself only wires it up.
//  - offered on phones with enough memory (the speech model takes about 250 MB while on)
//  - the first time, asks before the one-time 176 MB download
//  - turns off when the Reader is left or the app goes to the background
//  - pauses the Reader's Auto Scroll while on
//  - tells the reader's page which pangti to show
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AppState, Linking } from "react-native";
import { useSelector } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { STRINGS } from "@common";
import useAutopilot, { micAllowed, modelReady } from "./useAutopilot";

// Phones sold with 3 GB report about 2.6-2.9 GB; tested on a 2.5 GB Android emulator.
const MIN_MEMORY = 2.5e9;

const useAutopilotControl = ({ navigation, webViewRef, baniId, isParagraphMode }) => {
  const baniLength = useSelector((state) => state.baniLength);
  const [on, setOn] = useState(false);
  const available = useMemo(() => DeviceInfo.getTotalMemorySync() >= MIN_MEMORY, []);
  const post = useCallback(
    (message) => webViewRef.current?.postMessage(JSON.stringify(message)),
    [webViewRef]
  );

  const toggle = useCallback(async () => {
    if (on) {
      setOn(false);
    } else if (!(await micAllowed())) {
      Alert.alert(STRINGS.AUTOPILOT, STRINGS.AUTOPILOT_MIC_PERMISSION, [
        { text: STRINGS.cancel, style: "cancel" },
        { text: STRINGS.openSettings, onPress: () => Linking.openSettings() },
      ]);
    } else if (await modelReady()) {
      setOn(true);
    } else {
      Alert.alert(STRINGS.AUTOPILOT, STRINGS.AUTOPILOT_DOWNLOAD, [
        { text: STRINGS.cancel, style: "cancel" },
        { text: STRINGS.startDownload, onPress: () => setOn(true) },
      ]);
    }
  }, [on]);

  useEffect(() => navigation.addListener("blur", () => setOn(false)), [navigation]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") setOn(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (on) post({ autoScroll: 0 });
  }, [on, post]);

  const { status, progress } = useAutopilot(on, baniId, baniLength, isParagraphMode, (id) =>
    post({ autopilot: `${id}` })
  );

  return { on, toggle: available ? toggle : null, status, progress };
};

export default useAutopilotControl;
