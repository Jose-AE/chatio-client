import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  async function handleSignUp() {
    setLoading(true);
    if (!username || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "error",
        duration: 1000,
        isClosable: false,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    await axios
      .post(import.meta.env.VITE_BACKEND_URL + "/signup", {
        username,
        password,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setLoading(false);
        navigate("/chats");
      })
      .catch((err) => {
        //console.log(err);
        toast({
          title: "Username already in use",
          status: "error",
          duration: 1000,
          isClosable: false,
          position: "bottom",
        });
        setLoading(false);
      });
  }

  return (
    <VStack spacing="5px">
      <FormControl>
        <Input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <InputGroup>
          <Input
            type={showPassword ? "password" : "text"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Show" : "Hide"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <InputGroup>
          <Input
            type={showConfirmPassword ? "password" : "text"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Show" : "Hide"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        isLoading={loading}
        style={{ marginTop: 20 }}
        colorScheme="whatsapp"
        w="100%"
        onClick={handleSignUp}
      >
        Sign Up
      </Button>
    </VStack>
  );
}
