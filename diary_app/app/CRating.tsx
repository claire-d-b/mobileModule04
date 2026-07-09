import React from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";
import { Text } from "react-native-paper";

interface Props {
  isLandscape: boolean;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  color: string;
  focusColor: string;
}

const rate = [0, 1, 2, 3, 4];
const emotions = [
  "emoticon",
  "emoticon-happy",
  "emoticon-neutral",
  "emoticon-sad",
  "emoticon-angry",
];

const _ = ({ isLandscape, setRating, color, focusColor }: Props) => {
  const [checked, setChecked] = React.useState("rate_2");

  return (
    <View style={{ display: "flex", width: "100%" }}>
      <View
        style={{
          margin: 0,
          display: "flex",
          flexDirection: isLandscape ? "row" : "column",
          alignItems: "center",
          justifyContent: isLandscape ? "space-between" : "center",
          backgroundColor: color,
          alignSelf: "stretch",
          borderRadius: 10,
          marginTop: 5,
        }}
      >
        <Text
          style={{
            color: "white",
            padding: isLandscape ? 20 : 0,
            paddingTop: isLandscape ? 20 : 10,
          }}
        >
          Humeur du jour
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginRight: isLandscape ? 20 : 0,
          }}
        >
          {rate &&
            rate.map((_, i) => {
              return (
                <View key={`rate_${i}`}>
                  <IconButton
                    key={`rate_${i}`}
                    containerColor={`none`}
                    icon={emotions[i]}
                    iconColor={checked === `rate_${i}` ? focusColor : "white"}
                    mode={"contained"}
                    onPress={() => {
                      setChecked(`rate_${i}`);
                      setRating(i + 1);
                    }}
                  />
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};

export default _;
