import { Flex, Avatar, Text, Button } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chat({
  thisChat,
  img,
  chatName,
  socket,
  setLoadingMessages,
  messageList,
  loggedUser,
  setMessageList,
  selectedChat,
  setSelectedChat,
}) {
  const [lastMessage, setLastMessage] = useState(
    thisChat.messages.slice(-1)[0]
  ); //

  useEffect(() => {
    if (!localStorage.getItem("notifications" + thisChat._id)) {
      localStorage.setItem("notifications" + thisChat._id, 0);
    }
  }, []);

  const [notifications, setNotifications] = useState(
    parseInt(localStorage.getItem("notifications" + thisChat._id))
  );

  useEffect(() => {
    setLastMessage(thisChat.messages.slice(-1)[0]);
    setNotifications(
      parseInt(localStorage.getItem("notifications" + thisChat._id))
    );
  }, [thisChat.messages]);

  useEffect(() => {
    function addMessage(data) {
      if (data.chatId === thisChat._id) {
        localStorage.setItem(
          "notifications" + thisChat._id,
          parseInt(localStorage.getItem("notifications" + thisChat._id)) + 1
        );
      }
    }

    socket.on("recieve-message", addMessage);

    return () => socket.off("recieve-message", addMessage);
  }, [socket]);

  return (
    <>
      <Flex
        justifyContent="space-between"
        onClick={async () => {
          localStorage.setItem("notifications" + thisChat._id, 0);
          setNotifications(
            parseInt(localStorage.getItem("notifications" + thisChat._id))
          );
          setSelectedChat(thisChat);
          setLoadingMessages(true);
          await axios
            .get(
              import.meta.env.VITE_BACKEND_URL +
                "/getchatmessages/" +
                thisChat._id,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
            .then((res) => {
              //console.log(res.data); //
              //thisChat.messages = res.data;
              setMessageList(res.data);
              setLoadingMessages(false);
            })
            .catch((err) => {
              console.log(err);
            });
        }}
        bg={selectedChat._id === thisChat._id ? "gray.300" : "white"}
        p={2}
        align="center"
        _hover={{
          bg: selectedChat._id === thisChat._id ? "gray.300" : "gray.100",
          cursor: "pointer",
        }}
        height="75px"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex>
          <Avatar size="md" marginRight={2} src={img} />
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">
              {chatName}
            </Text>
            <Text
              fontSize="xs"
              overflow="hidden"
              isTruncated
              maxHeight="1rem"
              maxWidth="175px"
            >
              {lastMessage
                ? thisChat.isGroupChat
                  ? lastMessage.sender.username + ": " + lastMessage.content
                  : lastMessage.content
                : ""}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column">
          <Text fontSize="xs">
            {new Date(thisChat.lastActive).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text
            display={notifications > 0 ? "inline" : "none"}
            textAlign="center"
            width="30px"
            borderRadius="10px"
            bg="lightgreen"
          >
            {notifications}
          </Text>
        </Flex>
      </Flex>
    </>
  );
}
