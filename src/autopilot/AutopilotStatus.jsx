// Autopilot's one line of status (download progress, listening, microphone off), shown at the bottom
// of the Reader until a pangti is being followed; then it gets out of the way.
import React from "react";
import { StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import { colors, STRINGS } from "@common";

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.READER_FOOTER_COLOR,
    color: colors.TOOLBAR_TINT,
    fontSize: 13,
  },
});

const label = (status, progress) => {
  switch (status) {
    case "loading":
      return progress > 0 && progress < 1
        ? `${STRINGS.AUTOPILOT} · ${Math.round(progress * 100)}%`
        : `${STRINGS.AUTOPILOT} · …`;
    case "listening":
      return `${STRINGS.AUTOPILOT} · ${STRINGS.AUTOPILOT_LISTENING}`;
    case "mic":
      return STRINGS.AUTOPILOT_MIC_OFF;
    case "error":
      return STRINGS.AUTOPILOT_UNAVAILABLE;
    default:
      return null; // off, or following: nothing to show
  }
};

const AutopilotStatus = ({ status, progress }) => {
  const text = label(status, progress);
  return text ? (
    <Text style={styles.pill} accessibilityLiveRegion={status === "loading" ? "none" : "polite"}>
      {text}
    </Text>
  ) : null;
};

AutopilotStatus.propTypes = {
  status: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
};

export default AutopilotStatus;
