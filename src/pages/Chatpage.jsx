import {
  Avatar,
  Button,
  IconButton,
  Flex,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { SettingsIcon, AddIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import Chat from "../components/Chat";
import StartNewChat from "../components/StartNewChat";
import Chatbox from "../components/Chatbox";
import io from "socket.io-client";
import UserSettings from "../components/UserSettings";

const socket = io(import.meta.env.VITE_BACKEND_URL);

function Chatpage() {
  const [chats, setChats] = useState([]);
  const [loggedUser, setLoggedUser] = useState({});
  const [selectedChat, setSelectedChat] = useState({ _id: "" });
  const [messageList, setMessageList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  const {
    isOpen: isOpenNewChat,
    onOpen: onOpenNewChat,
    onClose: onCloseNewChat,
  } = useDisclosure();

  const {
    isOpen: isOpenUserSettings,
    onOpen: onOpenUserSettings,
    onClose: onCloseUserSettings,
  } = useDisclosure();

  function loadChats() {
    //get chats
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/chats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setLoggedUser(res.data.user);
        setChats(res.data.chats.sort((a, b) => b.lastActive - a.lastActive));

        res.data.chats.map(async (chat) => {
          await socket.emit("join-chat", chat._id);
          //console.log("joined chat: " + chat._id);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    //check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }

    loadChats();
  }, []);

  useEffect(() => {
    function addChat(chat) {
      if (selectedChat._id !== chat._id) {
        socket.emit("join-chat", chat._id);
        setChats((list) => [chat, ...list]);
      }
    }

    socket.on("chat-created", addChat);

    return () => socket.off("chat-created", addChat);
  }, [socket]);

  useEffect(() => {
    socket.on("recieve-message", (data) => {
      const editedChats = chats.map((chat) => {
        if (chat._id === data.chatId) {
          chat.lastActive = Date.now();
          const messages = [...chat.messages, data.message];
          chat.messages = messages;
          return chat;
        } else {
          return chat;
        }
      });
      setChats(editedChats.sort((a, b) => b.lastActive - a.lastActive)); ///

      //console.log(chats); /// this console log
    });
  }, [socket, chats]);

  useEffect(() => {
    setMessageList([]);
  }, [selectedChat]);

  return (
    <>
      <UserSettings
        logggedUser={loggedUser}
        isOpen={isOpenUserSettings}
        onClose={onCloseUserSettings}
      />

      <StartNewChat
        setLoadingMessages={setLoadingMessages}
        socket={socket}
        setChats={setChats}
        isOpen={isOpenNewChat}
        onClose={onCloseNewChat}
        setSelectedChat={setSelectedChat}
      />
      <Flex>
        <Flex
          w="500px"
          h="100vh"
          borderEnd="1px solid"
          borderColor="gray.200"
          direction="column"
        >
          <Flex
            h="75px"
            w="100%"
            align="center"
            p="10px"
            borderBottom="1px solid"
            borderColor="gray.200"
            justifyContent="space-between"
          >
            <Avatar src={loggedUser.pfp} size="md" />
            <Text fontSize="2xl" fontWeight="bold" p="10px">
              {loggedUser.username}
            </Text>
            <IconButton
              size="lg"
              isRound
              aria-label="Settings"
              icon={<SettingsIcon />}
              onClick={onOpenUserSettings}
            />
          </Flex>

          <Button m={2} height="30px" p={4} onClick={onOpenNewChat}>
            New Chat <AddIcon marginLeft={3} />
          </Button>

          <Flex overflow="scroll" direction="column">
            {chats.map((chat, i) => {
              return (
                <Chat
                  loggedUser={loggedUser}
                  key={i}
                  thisChat={chat}
                  socket={socket}
                  img={
                    chat.isGroupChat
                      ? chat.groupImage
                      : chat.participants.find(
                          (obj) => obj._id !== loggedUser._id
                        ).pfp
                  }
                  chatName={
                    chat.isGroupChat
                      ? chat.groupName
                      : chat.participants.find(
                          (obj) => obj._id !== loggedUser._id
                        ).username
                  }
                  setLoadingMessages={setLoadingMessages}
                  setMessageList={setMessageList}
                  selectedChat={selectedChat}
                  setSelectedChat={setSelectedChat}
                />
              );
            })}
          </Flex>
        </Flex>

        <Chatbox
          chats={chats}
          setChats={setChats}
          loadingMessages={loadingMessages}
          messageList={messageList}
          setMessageList={setMessageList}
          selectedChat={selectedChat}
          loggedUser={loggedUser}
          socket={socket}
        />
      </Flex>
    </>
  );
}

export default Chatpage;
