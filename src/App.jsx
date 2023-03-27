import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Button } from "@chakra-ui/react";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";
import { Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/chats" element={<Chatpage />} />
    </Routes>
  );
}

export default App;
