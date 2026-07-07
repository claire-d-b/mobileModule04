import React from "react";
import { View } from "react-native";
import { Dialog, Portal, Text } from "react-native-paper";
import CIconButton from "./CIconButton";

interface Props {
  visibleDialog: boolean;
  setVisibleDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showDialog: () => void;
  hideDialog: () => void;
  deleteEntry: (idx: number) => Promise<void>;
  idx: number;
}

const _ = ({
  visibleDialog,
  setVisibleDialog,
  showDialog,
  hideDialog,
  deleteEntry,
  idx,
}: Props) => {
  return (
    visibleDialog && (
      <View
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      >
        <Portal>
          <Dialog
            visible={visibleDialog}
            onDismiss={hideDialog}
            style={{
              display: "flex",
              backgroundColor: "#BBB0D1",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Dialog.Title style={{ color: "#534DB3" }}>
                Delete entry
              </Dialog.Title>
              <CIconButton
                mode="outlined"
                icon="close"
                iconColor="#534DB3"
                containerColor="transparent"
                size={20}
                onPress={hideDialog}
                disabled={false}
              />
            </View>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ color: "#534DB3" }}>
                This action is irreversible. Click on trash to delete
                permanently.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <CIconButton
                mode="contained"
                icon="trash-can-outline"
                iconColor="#BBB0D1"
                containerColor="#534DB3"
                size={20}
                onPress={() => {
                  deleteEntry(idx);
                  hideDialog();
                }}
                disabled={false}
              />
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    )
  );
};

export default _;
