import * as React from 'react';
import { Modal, Portal, Text, Button, PaperProvider, IconButton } from 'react-native-paper';
import { StyleProp, ViewStyle, View } from "react-native";
import CButton from './CButton';
import CIconButton from "./CIconButton";


const errorColor = "#A60838"
const successColor = "#085E24"
const infoColor = "#353172"

interface Props {
    type: string;
    message: string;
    visible: boolean;
    hideModal: () => void;
    showModal: () => void;
    style: StyleProp<ViewStyle>;
    children: React.ReactNode;  
}
const CModal = ({type, message, visible, hideModal, showModal, style, children}: Props) => {
  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 10, borderRadius: 10 };

  return (<>
      <Portal>
        <Modal style={style} visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <CIconButton style={{ alignSelf: "flex-end" }} icon="close" iconColor="#534DB3" containerColor="" size={20} onPress={hideModal} />
          {children}
          <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
            { type === "success" && <><CIconButton mode="outlined" style={{ borderColor: successColor, borderWidth: 1 }} icon="check" iconColor={successColor} containerColor="" size={12} onPress={() => {}} />
            <Text style={{ color: successColor }}>{message}</Text>
            </> || type === "error" && <><CIconButton mode="outlined" style={{ borderColor: errorColor, borderWidth: 1 }} icon="close" iconColor={errorColor} containerColor="" size={12} onPress={() => {}} />
            <Text style={{ color: errorColor }}>{message}</Text>
            </> || <></>}
          </View>
          <Text style={{ color: "#353172" }}>Add a diary entry or click outside this area to dismiss.</Text>
        </Modal>
      </Portal>
      <CButton msg="Add entry" variant="contained" textColor="white" labelStyle="" style={{ marginTop: 3 }} buttonColor="#534DB3" onPress={showModal} />
      </>
  );
};

export default CModal;