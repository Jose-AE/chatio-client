import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(true);

  async function handleLogin() {
    setLoading(true);
    await axios
      .post(import.meta.env.VITE_BACKEND_URL + "/login", {
        username,
        password,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setLoading(false);
        window.location.href = "/";
      }) //
      .catch((err) => {
        //console.log(err);
        toast({
          title: "Invalid username or password",
          status: "error",
          duration: 1000,
          isClosable: false,
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

      <Button
        isLoading={loading}
        style={{ marginTop: 20 }}
        colorScheme="whatsapp"
        w="100%"
        onClick={handleLogin}
      >
        Log In
      </Button>
    </VStack>
  );
}
