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
import { useAuth } from "../context/AuthContext";


/**
 * Dashboard page - main layout: Sidebar | Email List | Email Preview
 */
function Inbox() {
  const { user, loading: authLoading } = useAuth();
  const {
    importantEmail,
    fetchEmailAnalytics,
    emails: inboxEmailsRaw,
    nextPageToken,
    loading: inboxLoading,
    fetchEmails: loadInboxPage,
    searchTerm,
    handleSearch
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
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, "/inbox");
    }
  }, []);

useEffect(() => {
  handleSearch(searchQuery);
}, [searchQuery, handleSearch]);
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

else if (activeView === "analytics") {
  filteredEmails = emails;
} else if (activeView !== "inbox") {
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

const topSender = Object.entries(
  emails.reduce((acc, email) => {
    const sender = email.from || "Unknown";
    acc[sender] = (acc[sender] || 0) + 1;
    return acc;
  }, {})
).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

const topDomain = Object.entries(domainStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

if (authLoading) {
  return <p>Loading dashboard...</p>;
}

  return (
    <div className="dashboard" style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar
        domains={domains}
        domainStats={domainStats}
        inboxCount={inboxCount}
        pinnedCount={pinnedCount}
        starredCount={starredCount}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="dashboard-main" style={{ marginLeft: "240px" }}>
        <Header user={user} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px", borderRadius: "0.75rem", background: "#ffffff", padding: "16px", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>Inbox Overview</h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "6px" }}>
              {filteredEmails.length} messages in {activeView === "inbox" ? "Inbox" : activeView}.
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(12, 1fr)" }}>
            <div style={{ gridColumn: "span 4" }}>
              <div
                ref={listPanelRef}
                className="email-list-panel"
                style={{
                  overflowY: "auto",
                  maxHeight: "calc(100vh - 240px)",
                  borderRadius: "0.75rem",
                  background: "#ffffff",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                }}
              >                <EmailList
                  emailsData={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={handleSelectEmail}
                  onEmailUpdate={handleEmailUpdate}
                  loadingMore={inboxLoading && inboxEmailsRaw.length > 0}
                />
              </div>
            </div>

            <div style={{ gridColumn: "span 4" }}>
              <div
                className="email-preview-panel"
                style={{
                  overflowY: "auto",
                  maxHeight: "calc(100vh - 240px)",
                  borderRadius: "0.75rem",
                  background: "#ffffff",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                }}
              >
                <EmailPreview selectedEmail={selectedEmail} onEmailUpdate={handleEmailUpdate} />
              </div>
            </div>

            <div style={{ gridColumn: "span 4" }}>
              <div
                className="email-analytics-wrapper"
                style={{
                  overflowY: "auto",
                  maxHeight: "calc(100vh - 240px)",
                  borderRadius: "0.75rem",
                  background: "#ffffff",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                }}
              >
                <EmailAnalytics
                  importantEmail={importantEmail}
                  topSender={topSender}
                  topDomain={topDomain}
                  onImportantEmailClick={handleImportantEmailClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inbox;
