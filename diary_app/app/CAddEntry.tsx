import * as React from "react";
import { Modal, Portal, Text } from "react-native-paper";
import { StyleProp, ViewStyle, View } from "react-native";
import CIconButton from "./CIconButton";
import CTextInput from "./CTextInput";
import CRating from "./CRating";

const errorColor = "#A60838";
const successColor = "#085E24";

interface Props {
  isLandscape: boolean;
  type: string;
  message: string;
  visible: boolean;
  hideModal: () => void;
  showModal: () => void;
  style: StyleProp<ViewStyle>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setFeeling: React.Dispatch<React.SetStateAction<number>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => {};
}
const _ = ({
  isLandscape,
  type,
  message,
  visible,
  hideModal,
  showModal,
  style,
  title,
  setTitle,
  setFeeling,
  content,
  setContent,
  handleSubmit,
}: Props) => {
  const containerStyle = {
    backgroundColor: "white",
    paddingHorizontal: 10,
    margin: 10,
    marginTop: isLandscape ? 0 : 10,
    borderRadius: 10,
  };

  return (
    <Portal>
      <Modal
        style={style}
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={containerStyle}
      >
        <CIconButton
          style={{ alignSelf: "flex-end" }}
          icon="close"
          iconColor="#534DB3"
          containerColor=""
          size={20}
          onPress={hideModal}
        />
        <CTextInput
          secureTextEntry={false}
          right={<></>}
          onBlur={() => {}}
          onChangeText={(str) => {
            setTitle(str);
          }}
          label="Title"
          msg={title}
          placeholder="Please add a title"
          variant="outlined"
          textColor="#534DB3"
          outlineColor="#534DB3"
          outlineStyle={{ borderRadius: 10 }}
          activeOutlineColor="#534DB3"
          underlineColor="#534DB3"
          activeUnderlineColor="#534DB3"
          selectionColor="#534DB3"
          contentStyle={{}}
          style={{ margin: 0, backgroundColor: "white" }}
          disabled={false}
          multiline={false}
        />
        <CRating
          isLandscape={isLandscape}
          setRating={setFeeling}
          color="#BBB0D1"
          focusColor="#534DB3"
        />
        <CTextInput
          secureTextEntry={false}
          right={<></>}
          onBlur={() => {}}
          onChangeText={(str) => {
            setContent(str);
          }}
          label="Content"
          msg={content}
          placeholder="Please add entries"
          variant="outlined"
          textColor="#534DB3"
          outlineColor="#534DB3"
          outlineStyle={{ borderRadius: 10 }}
          activeOutlineColor="#534DB3"
          underlineColor="#534DB3"
          activeUnderlineColor="#534DB3"
          selectionColor="#534DB3"
          contentStyle={{}}
          style={{ margin: 0, backgroundColor: "white" }}
          disabled={false}
          multiline={true}
        />
        <View
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: isLandscape ? 0 : 10,
          }}
        >
          <Text
            style={{
              color: "#353172",
              flex: 1,
              flexShrink: 1,
              padding: isLandscape ? 0 : 20,
            }}
          >
            Add a diary entry or click outside this area to dismiss.
          </Text>
          <View style={{ alignSelf: "flex-end", marginRight: 10 }}>
            <CIconButton
              icon="plus"
              iconColor="white"
              containerColor="#534DB3"
              size={20}
              onPress={handleSubmit}
            />
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {(type === "success" && (
            <>
              <CIconButton
                mode="outlined"
                style={{ borderColor: successColor, borderWidth: 1 }}
                icon="check"
                iconColor={successColor}
                containerColor=""
                size={12}
                onPress={() => {}}
                disabled={true}
              />
              <Text
                style={{
                  color: successColor,
                  width: "100%",
                  padding: isLandscape ? 0 : 20,
                }}
              >
                {message}
              </Text>
            </>
          )) ||
            (type === "error" && (
              <>
                <CIconButton
                  mode="outlined"
                  style={{ borderColor: errorColor, borderWidth: 1 }}
                  icon="close"
                  iconColor={errorColor}
                  containerColor=""
                  size={12}
                  onPress={() => {}}
                  disabled={true}
                />
                <Text
                  style={{
                    color: errorColor,
                    width: "100%",
                    padding: isLandscape ? 0 : 20,
                  }}
                >
                  {message}
                </Text>
              </>
            )) || <></>}
        </View>
      </Modal>
    </Portal>
  );
};

export default _;
