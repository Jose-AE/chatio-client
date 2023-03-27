import {
  Modal,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

function NewChatForm({
  onClose,
  setSelectedChat,
  setChats,
  socket,
  setLoadingMessages,
}) {
  const toast = useToast();

  const [username, setUsername] = useState();
  const [loading, setLoading] = useState(false);

  function handleStartNewChat() {
    if (username) {
      setLoading(true);
      axios
        .post(
          import.meta.env.VITE_BACKEND_URL + "/startchat",
          { isGroupChat: false, recipient: username },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          setLoadingMessages(false);
          socket.emit("join-chat", res.data.chat._id);
          socket.emit("chat-created", res.data.chat);
          setChats((list) => [res.data.chat, ...list]);
          setSelectedChat(res.data.chat);
          onClose();
        })
        .catch((err) => {
          toast({
            title: err.response.data,
            status: "error",
            duration: 1000,
            isClosable: false,
          });
          setLoading(false);
        });
    } else {
      toast({
        title: "Username can't be empty",
        status: "error",
        duration: 500,
        isClosable: false,
      });
    }
  }

  return (
    <VStack spacing="5px">
      <FormControl>
        <Input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>

      <Button
        isLoading={loading}
        style={{ marginTop: 20 }}
        colorScheme="whatsapp"
        w="100%"
        onClick={handleStartNewChat}
      >
        Start Chat
      </Button>
    </VStack>
  );
}
function NewGroupChatForm({
  onClose,
  setSelectedChat,
  setChats,
  socket,
  setLoadingMessages,
}) {
  const toast = useToast();

  const [groupName, setGroupName] = useState();
  const [participants, setParticipants] = useState();
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);

  async function uploadImage() {
    if (!image || image.type !== "image/jpeg" || image.type !== "image/png")
      return "https://t4.ftcdn.net/jpg/03/78/40/51/360_F_378405187_PyVLw51NVo3KltNlhUOpKfULdkUOUn7j.jpg";

    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "duhzkhml3");

    let url = "";
    await axios
      .post("https://api.cloudinary.com/v1_1/duhzkhml3/image/upload", data)
      .then((res) => {
        url = res.data.url;
      })
      .catch((err) => {
        console.log(err);
      });

    return url;
  }

  async function handleCreateGroup() {
    if (!groupName) {
      toast({
        title: "Group name can't be empty",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!participants) {
      toast({
        title: "There must be atleast 1 other member",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    const image_url = await uploadImage();
    const groupParticipants = participants.split(",");

    setLoading(true);
    axios
      .post(
        import.meta.env.VITE_BACKEND_URL + "/startchat",
        {
          isGroupChat: true,
          participants: groupParticipants,
          groupName,
          image_url,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        setLoadingMessages(false);
        socket.emit("join-chat", res.data.chat._id);
        socket.emit("chat-created", res.data.chat);
        setChats((list) => [res.data.chat, ...list]);
        setSelectedChat(res.data.chat);
        onClose();
      })
      .catch((err) => {
        toast({
          title: err.response.data,
          status: "error",
          duration: 3000,
          isClosable: false,
        });
        setLoading(false);
      });
  }

  return (
    <VStack spacing="5px">
      <Input
        placeholder="Group name"
        onChange={(e) => setGroupName(e.target.value)}
      />

      <Input
        placeholder="Members (separated by , )"
        onChange={(e) => setParticipants(e.target.value)}
      />

      <FormControl>
        <Input
          accept="image/png, image/jpeg"
          capture="image"
          p={1}
          type="file"
          placeholder="Members (separated by , )"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </FormControl>

      <Button
        isLoading={loading}
        style={{ marginTop: 20 }}
        colorScheme="whatsapp"
        w="100%"
        onClick={handleCreateGroup}
      >
        Create Group
      </Button>
    </VStack>
  );
}

export default function StartNewChat({
  isOpen,
  onClose,
  setSelectedChat,
  setChats,
  socket,
  setLoadingMessages,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Start New Chat</ModalHeader>

        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Tabs isFitted variant="soft-rounded">
              <TabList mb="1em">
                <Tab>Chat</Tab>
                <Tab>Group Chat</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <NewChatForm
                    setLoadingMessages={setLoadingMessages}
                    socket={socket}
                    onClose={onClose}
                    setChats={setChats}
                    setSelectedChat={setSelectedChat}
                  />
                </TabPanel>

                <TabPanel>
                  <NewGroupChatForm
                    setLoadingMessages={setLoadingMessages}
                    socket={socket}
                    onClose={onClose}
                    setChats={setChats}
                    setSelectedChat={setSelectedChat}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
