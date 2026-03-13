import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import "./App.css";

function App() {
  return (
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
  );
}

export default App;
