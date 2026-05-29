import { Button } from "react-native-paper";
import { GestureResponderEvent } from "react-native";

interface Props {
  onPress: (e: GestureResponderEvent) => void;
  msg: string;
  variant: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  textColor: string;
  style: {};
  buttonColor: string;
  labelStyle: {};
}

export default function CButton({
  onPress,
  msg,
  variant,
  textColor,
  style,
  buttonColor,
  labelStyle,
}: Props) {
  return (
    <Button
      onPress={onPress}
      style={style}
      mode={variant}
      textColor={textColor}
      buttonColor={buttonColor}
      labelStyle={labelStyle}
    >
      {msg}
    </Button>
  );
}
