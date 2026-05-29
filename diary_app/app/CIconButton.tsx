import * as React from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';
import { GestureResponderEvent } from "react-native"
import { StyleProp, ViewStyle } from "react-native";


interface Props {
  style?: StyleProp<ViewStyle>;
  mode?: "outlined" | "contained" | "contained-tonal" | undefined;
  icon: string;
  iconColor: string;
  containerColor: string;
  size: number;
  onPress: (e: GestureResponderEvent) => void;
}

const CIconButton = ({ style, mode, icon, iconColor, containerColor,  size, onPress }: Props) => (
  <IconButton
    style={style}
    mode={mode}
    icon={icon}
    iconColor={iconColor}
    containerColor={containerColor}
    size={size}
    onPress={onPress}
  />
);

export default CIconButton;