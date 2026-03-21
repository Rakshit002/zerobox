'use client'
import Axios from "axios"
import api from "../api/axios"
import { getCurrentUser } from "../api/authApi";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import EmailList from "../components/email/EmailList";
import EmailPreview from "../components/email/EmailPreview";
import EmailAnalytics from "../components/email/EmailAnalytics";
import useEmails from "../hooks/useEmails";
import { useNavigate } from "react-router-dom";
import { getEmailById, getPinnedEmails, getStarredEmails } from "../api/EmailApi";


/**
 * Dashboard page - main layout: Sidebar | Email List | Email Preview
 */
function Inbox() {
  const {
    importantEmail,
    fetchEmailAnalytics,
    emails: inboxEmailsRaw,
    nextPageToken,
    loading: inboxLoading,
    fetchEmails: loadInboxPage
  } = useEmails();
  const [pinnedEmails, setPinnedEmails] = useState([]);
  const [starredEmails, setStarredEmails] = useState([]);

  const listPanelRef = useRef(null);

  /** Merge pin/star flags from DB into Gmail inbox rows (all loaded pages). */
  const emails = useMemo(() => {
    const pinnedIds = (pinnedEmails || []).map((p) => p.emailId);
    const starredIds = (starredEmails || []).map((s) => s.emailId);
    return inboxEmailsRaw.map((email) => ({
      ...email,
      pinned: pinnedIds.includes(email.id),
      starred: starredIds.includes(email.id)
    }));
  }, [inboxEmailsRaw, pinnedEmails, starredEmails]);

  const domains = useMemo(
    () => [...new Set(emails.map((email) => email.domain))],
    [emails]
  );

  const inboxCount = emails.length;

const pinnedCount = pinnedEmails.length;
const starredCount = starredEmails.length;
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

  /** Open Important Email intelligence item in the preview panel (same as list selection). */
  const handleImportantEmailClick = useCallback(async (important) => {
    if (!important?.id) return;
    try {
      const data = await getEmailById(important.id);
      setSelectedEmail(data.email);
    } catch (error) {
      console.error("Failed to load email preview:", error);
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
const[user,setUser]=useState(null)
const navigate=useNavigate();
//gettin user data after login;

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token")

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
// useEffect(()=>{
//     const fetchPinnedEmails = async () => {
//        try {

//     const data = await getPinnedEmails();

//     setPinnedEmails(data);

//   } catch (error) {
//     console.error("Failed to fetch pinned emails", error);
//   }
// }
//   fetchPinnedEmails();

// },[])


useEffect(() => {

  const bootstrapInbox = async () => {

    try {

      // 1️⃣ Pinned / starred from MongoDB (used to decorate Gmail rows)
      const pinned = await getPinnedEmails();
      console.log("pinned email", pinned);
      setPinnedEmails(pinned);

      const starred = await getStarredEmails();
      console.log("starred email", starred);
      setStarredEmails(starred);

      // 2️⃣ First Gmail page (hook replaces list; more pages via scroll + nextPageToken)
      await loadInboxPage();
      console.log("inbox first page loaded");

      // 3️⃣ Analytics (optional; must not block inbox)
      try {
        await fetchEmailAnalytics();
      } catch (analyticsError) {
        console.error("Failed to load analytics", analyticsError);
      }

    } catch (error) {
      console.error("Failed to load emails", error);
    }

  };

  bootstrapInbox();

}, [fetchEmailAnalytics, loadInboxPage]);

  // Infinite scroll: when user nears bottom of list panel, request next Gmail page.
  useEffect(() => {
    const panel = listPanelRef.current;
    if (!panel) return;

    const onScroll = () => {
      if (inboxLoading || !nextPageToken) return;
      const nearBottom =
        panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 120;
      if (nearBottom) {
        loadInboxPage(nextPageToken);
      }
    };

    panel.addEventListener("scroll", onScroll);
    return () => panel.removeEventListener("scroll", onScroll);
  }, [inboxLoading, nextPageToken, loadInboxPage]);

 

  // Flatten to find selected email (may be in any domain)
  const selectedEmailId = selectedEmail?.id ?? null;

  // Derive domains from backend data 
const pinnedEmailIds = (pinnedEmails || []).map(p => p.emailId);

const pinnedEmailList = emails.filter(email =>
  pinnedEmailIds.includes(email.id)
);
const starredEmailIds = (starredEmails || []).map(s => s.emailId);
const starredEmailList = emails.filter(email =>
  starredEmailIds.includes(email.id)
);
let filteredEmails = emails;

if (activeView === "pinned") {
  filteredEmails = pinnedEmailList;
}
else if (activeView === "starred") {
  filteredEmails = starredEmailList;
}

else if (activeView !== "inbox") {
  filteredEmails = emails.filter(
    email => email.domain === activeView
  );
}

 const handleEmailUpdate = useCallback((emailId, updates) => {

  // Pin/star flags come from MongoDB lists; merged view updates via useMemo.

  // Update pinnedEmails state
 if (updates.pinned === true) {

  setPinnedEmails((prev = []) => {

    const exists = prev.some(p => p.emailId === emailId);

    if (exists) return prev;

    return [...prev, { emailId }];

  });

}
  if(updates.pinned === false){
    setPinnedEmails((prev)=>{
      return prev.filter(p=>p.emailId!==emailId)
    })
  }
  if (updates.starred === true) {
    setStarredEmails((prev = []) => {
      const exists = prev.some((s) => s.emailId === emailId);
      if (exists) return prev;
      return [...prev, { emailId }];
    });
  }
  if (updates.starred === false) {
    setStarredEmails((prev = []) => {
      return prev.filter((s) => s.emailId !== emailId);
    });
  }

 

}, []);
const domainStats = emails.reduce((acc, email) => {

  if (!acc[email.domain]) {
    acc[email.domain] = 0;
  }

  acc[email.domain]++;

  return acc;

}, {});
  
  if (!user) {
  return <p>Loading dashboard...</p>;
}

  return (
    <div className="dashboard">
      <Sidebar
         domains={domains}
        domainStats={domainStats}
        inboxCount={inboxCount}
         pinnedCount={pinnedCount}
         starredCount={starredCount}
        activeView={activeView}
        onViewChange={setActiveView}
        
      />
      <div className="dashboard-main">
        <Header
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <EmailAnalytics
          importantEmail={importantEmail}
          onImportantEmailClick={handleImportantEmailClick}
        />
        <div className="dashboard-content">
          <div className="email-list-panel" ref={listPanelRef}>
            <EmailList
             emailsData={filteredEmails}
            activeView={activeView}
            searchQuery={searchQuery}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            onEmailUpdate={handleEmailUpdate}
            loadingMore={inboxLoading && inboxEmailsRaw.length > 0}
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
