import { Flex, Avatar, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Chat({
  img,
  name,
  chat,
  selectedChat,
  setSelectedChat,
  messageList,
  setMessageList,
  setLoadingMessages,
  socket,
  chatLastMessage,
  isGroupChat,
  index,
  chats,
}) {
  const [lastMessage, setLastMessage] = useState(chatLastMessage);
  const [notifications, setNotifications] = useState(0);
  //

  useEffect(() => {
    function addMessage(data) {
      if (data.chatId === chat._id) {
        console.log(data);
        //console.log(data.message.sender.username);
        setLastMessage(data.message);

        setNotifications(notifications + 1);
      }
    }

    socket.on("recieve-message", addMessage);

    return () => socket.off("recieve-message", addMessage);
  }, [socket]);

  useEffect(() => {
    //setLastMessage(messageList.slice(-1));
  }, [messageList]);

  return (
    <Flex
      justifyContent="space-between"
      onClick={async () => {
        setNotifications(0);
        setSelectedChat(chat);
        setLoadingMessages(true);
        await axios
          .get(
            import.meta.env.VITE_BACKEND_URL + "/getchatmessages/" + chat._id,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then((res) => {
            console.log(); //

            setMessageList(res.data);
            setLoadingMessages(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }}
      bg={selectedChat._id === chat._id ? "gray.300" : "white"}
      p={2}
      align="center"
      _hover={{
        bg: selectedChat._id === chat._id ? "gray.300" : "gray.100",
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
            {name}
          </Text>
          <Text
            fontSize="xs"
            overflow="hidden"
            isTruncated
            maxHeight="1rem"
            maxWidth="175px"
          >
            {chats[index].messages[0].content}
            {lastMessage
              ? isGroupChat
                ? lastMessage.sender.username + ": " + lastMessage.content
                : lastMessage.content
              : ""}
          </Text>
        </Flex>
      </Flex>
      <Text>
        {new Date(chat.lastActive).toLocaleString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text>{notifications}</Text>
    </Flex>
  );
}
