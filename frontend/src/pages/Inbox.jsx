'use client'
import Axios from "axios"
import api from "../api/axios"
import { getCurrentUser } from "../api/authApi";
import { useState,useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import EmailList from "../components/email/EmailList";
import EmailPreview from "../components/email/EmailPreview";
import { dummyEmailsData } from "../data/dummyEmails";

import { useNavigate } from "react-router-dom";
import { getInboxEmails,getEmailById } from "../api/EmailApi";


/**
 * Dashboard page - main layout: Sidebar | Email List | Email Preview
 */
function Inbox() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeView, setActiveView] = useState("inbox");


  const handleSelectEmail = async (email) => {
    try {
      const data = await getEmailById(email.id);
      setSelectedEmail(data.email);
    } catch (error) {
      console.error("Failed to load email preview:", error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const[domains,setDomains]=useState([]);
const[user,setUser]=useState(null)
const navigate=useNavigate();
//gettin user data after login;

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");
  console.log(tokenFromUrl);

  if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    // optional: clean URL
    window.history.replaceState({}, document.title, "/Inbox");
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
  api.get("/auth/me")
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

useEffect(()=>{
  const fetchEmails=async()=>{
    const data= await getInboxEmails();
      
    setEmails(data.emails);
      const uniqueDomains = [
  ...new Set(data.emails.map(email => email.domain))
];

setDomains(uniqueDomains);
  }


 
  fetchEmails();
  

},[]);


  // Flatten to find selected email (may be in any domain)
  const selectedEmailId = selectedEmail?.id ?? null;

  // Derive domains from backend data 
  const pinnedEmails = emails.filter(e => e.pinned);
const starredEmails = emails.filter(e => e.starred);
let filteredEmails = emails;

if (activeView === "pinned") {
  filteredEmails = pinnedEmails;
}

else if (activeView === "starred") {
  filteredEmails = starredEmails;
}

else if (activeView !== "inbox") {
  filteredEmails = emails.filter(
    email => email.domain === activeView
  );
}

  const handleEmailUpdate = useCallback((emailId, updates) => {

  setEmails((prevEmails) =>
    prevEmails.map((email) =>
      email.id === emailId
        ? { ...email, ...updates }
        : email
    )
  );

  setSelectedEmail((prev) =>
    prev?.id === emailId
      ? { ...prev, ...updates }
      : prev
  );

}, []);
  
  if (!user) {
  return <p>Loading dashboard...</p>;
}

  return (
    <div className="dashboard">
      <Sidebar
      domains={domains}
        activeView={activeView}
        onViewChange={setActiveView}
        
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
             emailsData={filteredEmails}
            activeView={activeView}
            searchQuery={searchQuery}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            onEmailUpdate={handleEmailUpdate}      
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

export default Inbox;
