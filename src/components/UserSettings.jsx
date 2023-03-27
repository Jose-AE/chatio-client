import {
  Modal,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function UserSettings({ isOpen, onClose, logggedUser }) {
  const toast = useToast();

  const [pfp, setPfp] = useState();
  const [loading, setLoading] = useState(false);
  const [isNewPfp, setIsNewPfp] = useState(false);

  useEffect(() => {
    setPfp();
    setIsNewPfp(false);
  }, [isOpen]);

  useEffect(() => {
    if (pfp !== logggedUser.pfp) {
      setIsNewPfp(true);
    }
  }, [pfp]);

  async function setImage(image) {
    if (!image) {
      setPfp(
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
      );
      return;
    }
    if (image.type === "image/jpeg" || image.type === "image/png") {
      setLoading(true);
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

      setPfp(url);
      setLoading(false);
    }
  }

  function updatePfp() {
    logggedUser.pfp = pfp;
    setIsNewPfp(false);
    axios
      .post(
        import.meta.env.VITE_BACKEND_URL + "/changepfp",
        { pfp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        toast({
          title: "Avatar changed successfully",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      })
      .catch((err) => {
        toast({
          title: err.response.data,
          status: "error",
          duration: 1000,
          isClosable: false,
        });
      });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>

        <ModalCloseButton />
        <ModalBody>
          <Flex>
            {loading ? (
              <Spinner m={10} size="xl" mx="auto" />
            ) : (
              <Avatar
                src={pfp ? pfp : logggedUser.pfp}
                marginBottom={5}
                size="xl"
                mx="auto"
              />
            )}
          </Flex>
          <Box>
            <VStack spacing="5px">
              <FormControl>
                <Input
                  p={1}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </FormControl>
              <Button
                isDisabled={!isNewPfp}
                isLoading={loading}
                style={{ marginTop: 20, marginBottom: 10 }}
                colorScheme="whatsapp"
                w="100%"
                onClick={updatePfp}
              >
                Update avatar
              </Button>
              <Button
                style={{ marginBottom: 10 }}
                colorScheme="red"
                w="100%"
                onClick={() => {
                  localStorage.setItem("token", "");
                  window.location.href = "/";
                }}
              >
                Logout
              </Button>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
