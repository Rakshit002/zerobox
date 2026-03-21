import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    
    <>
       <Toaster position="top-right" />
  

    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/inbox" element={<Inbox />} />
        </Route>
        <Route path="/" element={<Navigate to="/Inbox" replace />} />
        <Route path="*" element={<Navigate to="/Inbox" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
