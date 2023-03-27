import {
  Flex,
  Avatar,
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  InputRightAddon,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import axios, { Axios } from "axios";
import io from "socket.io-client";

function Message({ isOwnMessage, isGroupMessage, sender, message }) {
  return isOwnMessage ? (
    <Flex h="auto" direction="column" align="flex-end" m={2}>
      <Box
        height="auto"
        maxW={`${Math.min(300, message.content.length * 20)}px`}
        bg="lightblue"
        borderRadius="10px 10px 0 10px"
      >
        <Text p={2}>{message.content}</Text>
      </Box>
      <Text fontWeight="bold" fontSize="0.5rem" p={1} textAlign="right">
        {new Date(message.timestamp).toLocaleString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Flex>
  ) : (
    <Flex h="auto" m={2} direction="column" align="flex-start">
      <Flex m={1} display={isGroupMessage ? "flex" : "none"}>
        <Avatar size="xs" src={sender.pfp} />
        <Text marginLeft={1}>{sender.username}</Text>
      </Flex>

      <Box
        height="auto"
        maxW={`${Math.min(300, message.content.length * 20)}px`}
        bg="lightgreen"
        borderRadius="0 10px 10px 10px"
      >
        <Text p={2}>{message.content}</Text>
      </Box>
      <Text fontWeight="bold" fontSize="0.5rem" p={1} textAlign="left">
        {new Date(message.timestamp).toLocaleString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Flex>
  );
}

function Bottombar({
  setMessageToSend,
  sendMessage,
  messageToSend,
  loadingMessages,
}) {
  const [inputValue, setInputValue] = useState("");

  return (
    <Flex h="60px" p={3}>
      <FormControl flex={1}>
        <InputGroup>
          <Input
            isDisabled={loadingMessages}
            autoComplete="off"
            value={inputValue}
            bg="gray.200"
            focusBorderColor="transparent"
            placeholder="Type a message"
            onChange={(e) => {
              setMessageToSend(e.target.value);
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (messageToSend !== "") {
                  setMessageToSend("");
                  setInputValue("");
                  sendMessage();
                }
              }
            }}
          />
          <InputRightAddon
            cursor="pointer"
            onClick={() => {
              if (messageToSend !== "") {
                setMessageToSend("");
                setInputValue("");
                sendMessage();
              }
            }}
            children={<IoSend />}
          />
        </InputGroup>
      </FormControl>
    </Flex>
  );
}

function Topbar({ selectedChat, loggedUser }) {
  return (
    <Flex
      w="100%"
      h="75px"
      align="center"
      p="10px"
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <Avatar
        src={
          selectedChat.isGroupChat
            ? selectedChat.groupImage
            : selectedChat.participants.find(
                (obj) => obj._id !== loggedUser._id
              ).pfp
        }
      />
      <Text fontSize="2xl" fontWeight="bold" marginLeft={5}>
        {selectedChat.isGroupChat
          ? selectedChat.groupName
          : selectedChat.participants.find((obj) => obj._id !== loggedUser._id)
              .username}
      </Text>
    </Flex>
  );
}

export default function Chatbox({
  selectedChat,
  loggedUser,
  socket,
  messageList,
  setMessageList,
  loadingMessages,
  chats,
  setChats,
}) {
  const messageContainer = useRef(null);
  const [messageToSend, setMessageToSend] = useState("");

  async function sendMessage() {
    const message = {
      sender: loggedUser,
      content: messageToSend,
      timestamp: Date.now(),
    };

    const editedChats = chats.map((chat) => {
      if (chat._id === selectedChat._id) {
        const messages = [...selectedChat.messages, message];
        //console.log(messages);
        selectedChat.messages = messages;
        selectedChat.lastActive = Date.now();
        return selectedChat;
      } else {
        return chat;
      }
    });
    setChats(editedChats.sort((a, b) => b.lastActive - a.lastActive));

    setMessageList((list) => [...list, message]);

    await socket.emit("send-message", { chatId: selectedChat._id, message });

    axios
      .post(
        import.meta.env.VITE_BACKEND_URL + "/savemessage",
        { chat: selectedChat, message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {})
      .catch((err) => {
        toast({
          title: err.response.data,
          status: "error",
          duration: 1000,
          isClosable: false,
        });
      });
  }

  useEffect(() => {
    if (messageContainer.current) {
      messageContainer.current.scrollTo({
        top: messageContainer.current.scrollHeight,
      });
    }

    function addMessage(data) {
      //console.log(data.chatId);
      //console.log(selectedChat._id);
      if (data.chatId === selectedChat._id) {
        setMessageList((list) => [...list, data.message]);
      }
    }

    socket.on("recieve-message", addMessage);

    return () => socket.off("recieve-message", addMessage);
  }, [socket, messageList]);

  return selectedChat._id.length > 2 ? (
    //if chat selected
    <Flex width="100%" h="100vh" direction="column">
      <Topbar selectedChat={selectedChat} loggedUser={loggedUser} />

      <Flex
        flex={1}
        display={loadingMessages ? "flex" : "none"}
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" />
      </Flex>

      <Flex
        ref={messageContainer}
        flex={1}
        direction="column"
        overflow="scroll"
        display={loadingMessages ? "none" : "flex"}
      >
        {messageList.map((message, i) => (
          <Message
            key={i}
            isOwnMessage={message.sender._id === loggedUser._id}
            isGroupMessage={selectedChat.isGroupChat}
            sender={message.sender}
            message={message}
          />
        ))}
      </Flex>
      <Bottombar
        loadingMessages={loadingMessages}
        messageToSend={messageToSend}
        setMessageToSend={setMessageToSend}
        sendMessage={sendMessage}
      />
    </Flex>
  ) : (
    //if no chat selected
    <Flex bg="lightgreen" width="100%" direction="column"></Flex>
  );
}
