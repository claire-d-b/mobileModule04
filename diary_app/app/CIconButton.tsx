import * as React from "react";
import { IconButton } from "react-native-paper";
import { GestureResponderEvent } from "react-native";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  mode?: "outlined" | "contained" | "contained-tonal" | undefined;
  icon: string;
  iconColor: string;
  containerColor?: string;
  size: number;
  onPress: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  theme?: {};
}

const _ = ({
  style,
  mode,
  icon,
  iconColor,
  containerColor,
  size,
  onPress,
  disabled,
  theme,
}: Props) => (
  <IconButton
    style={style}
    mode={mode}
    icon={icon}
    iconColor={iconColor}
    containerColor={containerColor}
    size={size}
    onPress={onPress}
    disabled={disabled}
    theme={theme}
  />
);

export default _;
