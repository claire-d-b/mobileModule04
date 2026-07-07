import * as React from "react";
import { Chip, MD3Theme } from "react-native-paper";
import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

interface Props {
  theme?: Partial<MD3Theme>;
  onPress: (e: GestureResponderEvent) => void;
  label: string;
  mode: "flat" | "outlined";
  textStyle: StyleProp<TextStyle>;
  style: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  children: React.ReactNode;
  icon: string;
  disabled: boolean | undefined;
}

const _ = ({
  theme,
  onPress,
  label,
  mode,
  textStyle,
  style,
  children,
  icon,
  disabled,
}: Props) => (
  <Chip
    theme={theme}
    icon={icon}
    mode={mode}
    textStyle={textStyle}
    style={style}
    onPress={() => console.log("Pressed")}
    accessibilityLabel={label}
    disabled={disabled}
  >
    {children}
  </Chip>
);

export default _;
