import React, { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { GestureResponderEvent } from "react-native";

interface Props {
  secureTextEntry: boolean | undefined;
  right: React.ReactNode;
  onBlur: (args: any) => void;
  onChangeText: (text: string) => void;
  label: string;
  msg: string;
  placeholder: string;
  variant: "flat" | "outlined";
  textColor: string;
  outlineColor: string;
  outlineStyle: {};
  activeOutlineColor: string;
  underlineColor: string;
  activeUnderlineColor: string;
  selectionColor: string;
  contentStyle: {};
  style: {};
  disabled: boolean | undefined;
  multiline: boolean | undefined;
}

export default function CTextInput({
  secureTextEntry,
  right,
  onBlur,
  onChangeText,
  label,
  msg,
  placeholder,
  variant,
  textColor,
  outlineColor,
  outlineStyle,
  activeOutlineColor,
  underlineColor,
  activeUnderlineColor,
  selectionColor,
  contentStyle,
  style,
  disabled,
  multiline
}: Props) {
  return (
    <TextInput
      secureTextEntry={secureTextEntry}
      right={right}
      onBlur={onBlur}
      onChangeText={onChangeText}
      label={label}
      value={msg}
      placeholder={placeholder}
      mode={variant}
      textColor={textColor}
      outlineColor={outlineColor}
      outlineStyle={outlineStyle}
      underlineColor={underlineColor}
      activeUnderlineColor={activeUnderlineColor}
      selectionColor={selectionColor}
      contentStyle={contentStyle}
      style={style}
      disabled={disabled}
      multiline={multiline}
    />
  );
}
