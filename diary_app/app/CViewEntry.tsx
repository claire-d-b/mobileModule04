import { View, useWindowDimensions, ScrollView } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import CIconButton from "./CIconButton";
import CChip from "./CChip";
import { formatDate } from "../utils/utils";

interface Entry {
  id: number;
  date: string;
  title: string;
  feeling: number;
  content: string;
  created_at: string;
}

interface Props {
  emotions: string[];
  containerStyle: {};
  details: boolean;
  hideDetails: () => void;
  selectedEntry: Entry | null;
}

const _ = ({
  emotions,
  containerStyle,
  details,
  hideDetails,
  selectedEntry,
}: Props) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return (
    <View>
      <Portal>
        <Modal
          style={{
            padding: 0,
            alignSelf: "center",
            margin: 0,
            marginBottom: 20,
          }}
          visible={details}
          onDismiss={hideDetails}
          contentContainerStyle={containerStyle}
        >
          <CIconButton
            style={{ alignSelf: "flex-end" }}
            icon="close"
            iconColor="#534DB3"
            containerColor=""
            size={20}
            onPress={hideDetails}
          />
          {
            <ScrollView
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              <View
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <CChip
                      onPress={() => {}}
                      label=""
                      mode="outlined"
                      icon=""
                      disabled={true}
                      textStyle={{ color: "#534DB3" }}
                      style={{
                        borderColor: "#534DB3",
                        borderWidth: 1,
                      }}
                    >
                      <Text style={{ color: "#534DB3" }}>
                        {formatDate(
                          selectedEntry?.date
                            ? new Date(selectedEntry.date)
                            : new Date(),
                        )}
                      </Text>
                    </CChip>
                    <CIconButton
                      icon={`${
                        emotions[(selectedEntry?.feeling ?? 1) - 1]
                      }-outline`}
                      iconColor="#534DB3"
                      containerColor=""
                      size={20}
                      style={{ alignSelf: "center" }}
                      onPress={() => {}}
                      disabled={true}
                      theme={{
                        colors: {
                          onSurfaceDisabled: "#534DB3",
                        },
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      color: "#353172",
                      backgroundColor: "#BBB0D1",
                      borderRadius: 8,
                      padding: 20,
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedEntry?.title}
                  </Text>

                  <Text
                    style={{
                      color: "#534DB3",
                      padding: 10,
                      alignSelf: "flex-start",
                    }}
                  >
                    {selectedEntry?.content}
                  </Text>
                </View>
              </View>
            </ScrollView>
          }
        </Modal>
      </Portal>
    </View>
  );
};

export default _;
