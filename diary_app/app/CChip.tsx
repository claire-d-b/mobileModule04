import * as React from 'react';
import { Chip, MD3Theme } from 'react-native-paper';
import { Animated, GestureResponderEvent, StyleProp, ViewStyle, TextStyle } from "react-native";

interface Props {
  theme?: Partial<MD3Theme>;
  onPress: (e: GestureResponderEvent) => void;
  label: string;
  mode: "flat" | "outlined";
  textStyle: StyleProp<TextStyle>;
  style: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  buttonColor: string;
  children: React.ReactNode;
  icon: string;
  disabled: boolean | undefined;
}

const CChip = ({theme, onPress, label, mode, children, icon, disabled}: Props) => (
  <Chip theme={theme} icon={icon} mode={mode} onPress={() => console.log('Pressed')} accessibilityLabel={label} disabled={disabled}>{children}</Chip>
);

export default CChip;