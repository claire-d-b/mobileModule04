import * as React from 'react';
import { StyleProp, ViewStyle } from "react-native"
import { Avatar } from 'react-native-paper';

interface Props {
    size: number;
    icon: string;
    color: string;
    style: StyleProp<ViewStyle>;
}

const _ = ({size, icon, color, style}: Props) => (
  <Avatar.Icon size={size} icon={icon} color={color} style={style} />
);

export default _;