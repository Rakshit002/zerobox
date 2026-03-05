import { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailPreview from "../components/EmailPreview";
import { dummyEmailsData } from "../data/dummyEmails";

/**
 * Dashboard page - main layout: Sidebar | Email List | Email Preview
 */
function Dashboard() {
  const [emailsData, setEmailsData] = useState(dummyEmailsData);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Flatten to find selected email (may be in any domain)
  const selectedEmailId = selectedEmail?.id ?? null;

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

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <div className="dashboard-content">
          <div className="email-list-panel">
            <EmailList
              emailsData={emailsData}
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
