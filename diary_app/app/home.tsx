import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";
import { View, Platform, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuthContext } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Modal, Portal, Text, Button, PaperProvider } from "react-native-paper";
import CTextInput from "./CTextInput";
import CIconButton from "./CIconButton";
import CRating from "./CRating";
import CChip from "./CChip";
import CModal from "./CModal";
import CDialog from "./CDialog";
import CAvatar from "./CAvatar";
import type { MD3Colors } from "react-native-paper";
import CButton from "./CButton";
import { Background } from "@react-navigation/elements";

const nbOfEntriesPerPage = 6;

const emotions = [
  "emoticon",
  "emoticon-happy",
  "emoticon-neutral",
  "emoticon-sad",
  "emoticon-angry",
];

const backendUrl = "http://192.168.1.192:3000";

interface Entry {
  id: number;
  date: string;
  title: string;
  feeling: number;
  content: string;
  created_at: string;
}

interface deleteProps {
  setDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  i: number;
}

interface PaginatedResponse {
  entries: Entry[];
  page: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Props {
  setEntries: [];
}

const Home = () => {
  const { localLogin } = useAuthContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState(1);

  const [visible, setVisible] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const showDialog = () => setVisibleDialog(true);
  const hideDialog = () => setVisibleDialog(false);

  // Dans Home.tsx
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [deleted, setDeleted] = useState(false);

  const [details, setDetails] = useState(false);
  const showDetails = () => setDetails(true);
  const hideDetails = () => {
    setSelectedIndex(null);
    setDetails(false);
  };

  const [page, setPage] = useState(0);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const [pressed, setPressed] = useState<boolean[]>([false]);
  const containerStyle = {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
  };

  const auth = getAuth();
  const [email, setEmail] = useState<string | null>(localLogin ?? null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const resolvedEmail = user?.email ?? localLogin ?? null;
      setEmail(resolvedEmail);
      // ✅ passe resolvedEmail
      if (resolvedEmail) fetchEntries(0, resolvedEmail);
    });
    return () => unsubscribe();
  }, [localLogin]);

  useEffect(() => {
    if (email) fetchEntries(page, email);
  }, [entries.length]); // ← se déclenche quand le nombre d'entrées change

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toISOString().split("T")[0]; // "2026-05-01"
  };

  const fetchEntries = async (
    pageNumber = 0,
    resolvedEmail?: string | null,
  ) => {
    const emailToUse = resolvedEmail ?? email;
    if (!emailToUse) return;

    try {
      const res = await fetch(
        `${backendUrl}/entries/${encodeURIComponent(emailToUse)}?page=${pageNumber}`,
      );
      const data = await res.json();
      if (!res.ok) return;

      const list: Entry[] = data.entries ?? [];
      setEntries(list);
      setPressed(new Array(list.length).fill(false));
      setHasNext(data.hasNext); // ✅
      setHasPrev(data.hasPrev); // ✅
    } catch (err) {
      console.error("❌ Error fetching entries:", err);
    }
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!title || !content) {
      setMessage("Please provide a title and content.");
      setType("error");
      return;
    }
    console.log("📡 auth.currentUser:", auth.currentUser?.email);
    console.log("📡 email utilisé:", email);

    try {
      const res = await fetch(`${backendUrl}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          title,
          feeling,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to create entry:", data.error);
        return;
      }

      console.log("✅ Entry created:", data);
      setMessage("Entry successfully created!");
      setType("success");

      // Reset
      setTitle("");
      setContent("");
      setFeeling(1);
      await fetchEntries(0, email);
      hideModal();
    } catch (err) {
      console.error("❌ Error creating entry:", err);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      const res = await fetch(`${backendUrl}/entries/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Failed to delete entry:", data.error);
        return;
      }
      console.log("✅ Entry deleted:", data.entry);

      // ← si c'était la dernière entrée de la page, revenir à la page précédente
      if (entries.length === 1 && page > 0) {
        const prevPage = page - 1;
        setPage(prevPage);
        await fetchEntries(prevPage, email);
      } else {
        await fetchEntries(page, email);
      }
    } catch (err) {
      console.error("❌ Error deleting entry:", err);
    }
  };

  const loadMore = async () => {
    if (hasNext) {
      // ✅ au lieu de page < totalPages
      const nextPage = page + 1;
      await fetchEntries(nextPage, email);
      setPage(nextPage);
    }
  };

  const loadLess = async () => {
    if (hasPrev) {
      // ✅ au lieu de page > 0
      const nextPage = page - 1;
      await fetchEntries(nextPage, email);
      setPage(nextPage);
    }
  };

  const selectedEntry = selectedIndex !== null ? entries[selectedIndex] : null;

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top", "bottom", "left", "right"]}
    >
      <PaperProvider>
        <View
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CAvatar
              size={80}
              icon="account"
              color="white"
              style={{ backgroundColor: "#534DB3" }}
            />
            <Text style={{ padding: 20, color: "#353172" }}>{email}</Text>
          </View>
          <Text style={{ color: "#353172", padding: 40 }}>
            Add a new entry to your diary by clicking Add entry. You can click
            on a specific entry in the below list to get details.
          </Text>
          <CModal
            visible={visible}
            hideModal={hideModal}
            showModal={showModal}
            style={{ width: "100%", height: "100%" }}
          >
            <View style={{ width: "100%", alignSelf: "flex-start" }}>
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
                style={{ marginHorizontal: 20, backgroundColor: "white" }}
                disabled={false}
                multiline={false}
              />
            </View>
            <View style={{ display: "flex", width: "100%" }}>
              <CRating
                setRating={setFeeling}
                color="#BBB0D1"
                focusColor="#534DB3"
              />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
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
                  style={{ marginHorizontal: 20, backgroundColor: "white" }}
                  disabled={false}
                  multiline={true}
                />
              </View>
              <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                <CIconButton
                  icon="plus"
                  iconColor="white"
                  containerColor="#534DB3"
                  size={20}
                  onPress={handleSubmit}
                />
              </View>
            </View>
          </CModal>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: 20,
            }}
          >
            {entries &&
              entries.length > 0 &&
              entries.map((e, i) => {
                return (
                  <Pressable
                    key={`entry_${i}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginHorizontal: 20,
                      marginVertical: 2.5,
                      padding: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: pressed[i] ? "#534DB3" : "#BBB0D1",
                      borderRadius: 10,
                    }}
                    onPressIn={() => {
                      setPressed((prev) =>
                        prev.map((v, idx) => (idx === i ? true : v)),
                      );
                    }}
                    onPressOut={() => {
                      setPressed((prev) =>
                        prev.map((v, idx) => (idx === i ? false : v)),
                      );
                      setSelectedIndex(i);
                      showDetails();
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        margin: 5,
                      }}
                    >
                      <CChip
                        theme={{
                          colors: {
                            surfaceDisabled: "#BBB0D1",
                            onSurfaceDisabled: "#534DB3",
                          } as any,
                        }}
                        onPress={() => {}}
                        label=""
                        mode="outlined"
                        textStyle={{ color: "#534DB3" }}
                        style={{}}
                        icon=""
                        disabled={true}
                      >
                        <Text style={{ color: "#534DB3" }}>
                          {formatDate(e.date)}
                        </Text>
                      </CChip>
                    </View>
                    <CIconButton
                      icon={emotions[(e.feeling ?? 1) - 1]}
                      iconColor="#534DB3"
                      containerColor=""
                      size={20}
                      onPress={() => {}}
                      disabled={true}
                      theme={{
                        colors: {
                          onSurfaceDisabled: "white", // ← couleur de l'icône quand disabled
                        },
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        flexDirection: "row",
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          color: pressed[i] ? "white" : "#353172",
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {e.title}
                      </Text>
                    </View>
                    <CIconButton
                      icon="trash-can-outline"
                      iconColor={pressed[i] ? "white" : "#534DB3"}
                      containerColor="transparent"
                      size={20}
                      onPress={() => {
                        setEntryToDelete(e.id); // ← stocke le bon id
                        showDialog();
                      }}
                    />
                    {details && (
                      <>
                        <Portal>
                          <Modal
                            style={{ width: "100%", padding: 10 }}
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
                              <View
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  paddingBottom: 20,
                                  paddingLeft: 20,
                                  paddingRight: 20,
                                  // height: "100%",
                                }}
                              >
                                <View
                                  style={{
                                    display: "flex",
                                    width: "100%",
                                    flexDirection: "row",
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
                                    textStyle={{}}
                                    style={{
                                      borderColor: "#534DB3", // ← directement dans style
                                      borderWidth: 1,
                                    }}
                                  >
                                    <Text style={{ color: "#534DB3" }}>
                                      {formatDate(
                                        selectedEntry?.date ??
                                          formatDate(
                                            new Date().toLocaleDateString(),
                                          ),
                                      )}
                                    </Text>
                                  </CChip>
                                  <CIconButton
                                    icon={`${
                                      emotions[
                                        (selectedEntry?.feeling ?? 1) - 1
                                      ]
                                    }-outline`}
                                    iconColor="#534DB3"
                                    containerColor=""
                                    size={20}
                                    onPress={() => {}}
                                    disabled={true}
                                    theme={{
                                      colors: {
                                        onSurfaceDisabled: "#534DB3", // ← couleur de l'icône quand disabled
                                      },
                                    }}
                                  />
                                  <CChip
                                    theme={{
                                      colors: {
                                        surfaceDisabled: "#BBB0D1",
                                        onSurfaceDisabled: "#534DB3",
                                      } as any,
                                    }}
                                    onPress={() => {}}
                                    label=""
                                    mode="flat"
                                    textStyle={{ color: "white" }}
                                    style={{ backgroundColor: "#BBB0D1" }}
                                    icon=""
                                    disabled={true}
                                  >
                                    <Text style={{ color: "#534DB3" }}>
                                      {selectedEntry?.title}
                                    </Text>
                                  </CChip>
                                </View>
                                <Text style={{ color: "#534DB3" }}>
                                  {selectedEntry?.content}
                                </Text>
                              </View>
                            }
                            <View
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            ></View>
                          </Modal>
                        </Portal>
                      </>
                    )}
                  </Pressable>
                );
              })}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <CIconButton
              icon="chevron-left"
              iconColor="#534DB3"
              containerColor=""
              size={25}
              onPress={loadLess}
            />
            <CIconButton
              icon="chevron-right"
              iconColor="#534DB3"
              containerColor=""
              size={25}
              onPress={loadMore}
            />
          </View>
        </View>
        <CDialog
          visibleDialog={visibleDialog}
          setVisibleDialog={setVisibleDialog}
          showDialog={showDialog}
          hideDialog={hideDialog}
          deleteEntry={deleteEntry}
          idx={entryToDelete ?? -1}
        />
      </PaperProvider>
    </SafeAreaView>
  );
};

export default Home;
