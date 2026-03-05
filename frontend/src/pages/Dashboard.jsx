'use client'
import Axios from "axios"
import { useState,useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailPreview from "../components/EmailPreview";
import { dummyEmailsData } from "../data/dummyEmails";

import { useNavigate } from "react-router-dom";


/**
 * Dashboard page - main layout: Sidebar | Email List | Email Preview
 */
function Dashboard() {
  const [emailsData, setEmailsData] = useState(dummyEmailsData);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeView, setActiveView] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
const[user,setUser]=useState(null)
const navigate=useNavigate();
//gettin user data after login;

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    // optional: clean URL
    window.history.replaceState({}, document.title, "/dashboard");
  }
}, []);

useEffect(()=>{
     const token = localStorage.getItem("token"); // Assuming 'authToken' is the key you use
         console.log(token)
    // If no token is found, redirect to login
     if (!token) {
    navigate("/login");
    return;
  }
  Axios.get("http://localhost:3000/api/auth/me",{
    headers: {
    Authorization: `Bearer ${token}`,
  },
  })
  .then((res)=>{
    console.log(res.data)
    if(!res.data.loggedIn){
      navigate("/login")
    }else{
      setUser(res.data.user);
    }
  })
  .catch(()=>navigate("/login"))
},[]);

  // Flatten to find selected email (may be in any domain)
  const selectedEmailId = selectedEmail?.id ?? null;

  // Derive domains from backend data - TODO: replace with GET /api/domains
  const domains =
    emailsData?.domains?.map((d) => d.domain) ?? [];

  const handleSelectEmail = useCallback((email) => {
    setSelectedEmail(email);
  }, []);

  const handleEmailUpdate = useCallback((emailId, updates) => {
    setEmailsData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      for (const domainObj of next.domains) {
        const email = domainObj.emails.find((e) => e.id === emailId);
        if (email) {
          Object.assign(email, updates);
          break;
        }
      }
      return next;
    });
    setSelectedEmail((prev) =>
      prev?.id === emailId ? { ...prev, ...updates } : prev
    );
  }, []);
  if (!user) {
  return <p>Loading dashboard...</p>;
}

  return (
    <div className="dashboard">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        domains={domains}
      />
      <div className="dashboard-main">
        <Header
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="dashboard-content">
          <div className="email-list-panel">
            <EmailList
              emailsData={emailsData}
              activeView={activeView}
              searchQuery={searchQuery}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
            />
          </div>
          <div className="email-preview-panel">
            <EmailPreview
              selectedEmail={selectedEmail}
              onEmailUpdate={handleEmailUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
