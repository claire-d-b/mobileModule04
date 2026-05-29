import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, IconButton, PaperProvider, Checkbox } from 'react-native-paper';
import { Chip, RadioButton, List, Icon } from 'react-native-paper';
import { TextInput, Button, Text } from 'react-native-paper';

interface Props {
    setRating: React.Dispatch<React.SetStateAction<number>>;
    color: string;
    focusColor: string;
}

const rate = [0, 1, 2, 3, 4];
const emotions = [
  'emoticon',
  'emoticon-happy',
  'emoticon-neutral',
  'emoticon-sad',
  'emoticon-angry',
];

const _ = ({ setRating, color, focusColor }: Props) => {
  const [checked, setChecked] = React.useState('rate_2');

  return (
    <View style={{ display: "flex", width: "100%" }}>
    <View style={{ display: "flex", backgroundColor: color, alignSelf: "stretch", borderRadius: 10, marginHorizontal: 20, marginTop: 5 }}>
      <Text
        style={{ color: "white", padding: 10 }}>
        Humeur du jour
      </Text>
      <View style={{ display: 'flex', flexDirection: 'row', width: "100%", justifyContent: "center"}}>
        {rate &&
          rate.map((_, i) => {
            return (
              <View key={`rate_${i}`}>
                <IconButton
                  key={`rate_${i}`}
                  containerColor={`none`}
                  icon={emotions[i]}
                  iconColor={
                    checked === `rate_${i}` ? focusColor : 'white'
                  }
                  mode={'contained'}
                  onPress={() => { setChecked(`rate_${i}`); setRating(i+1); }}
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