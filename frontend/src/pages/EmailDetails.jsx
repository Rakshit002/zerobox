import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEmailById } from "../api/EmailApi";
import { getDemoEmailById } from "../data/demoEmails";
import { useAuth } from "../context/AuthContext";

/**
 * Email Details Page - Route-based email viewing
 * Displays full email content when user navigates to /inbox/:id
 */
function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setLoading(true);
        // ===== DEMO MODE START =====
        const isDemo = localStorage.getItem("demoMode") === "true";
        let data;
        if (isDemo) {
          data = getDemoEmailById(id);
        } else {
          // ===== DEMO MODE END =====

          // ===== REAL MODE START =====
          data = await getEmailById(id);
          // ===== REAL MODE END =====
        }
        setEmail(data?.email);
      } catch (error) {
        console.error("Failed to load email:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmail();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div>Loading email...</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div>Email not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/inbox")}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#0f172a",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          ← Back to Inbox
        </button>

        {/* Email Content Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "1rem",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.1)",
            padding: "2rem",
          }}
        >
          {/* Email Header */}
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {email.subject}
              </h1>
              
              {/* Category Badge */}
              {email.category && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    backgroundColor: 
                      email.category === "promotion" ? "#fef3c7" :
                      email.category === "newsletter" ? "#dbeafe" :
                      email.category === "updates" ? "#dbeafe" :
                      "#e2e8f0",
                    color:
                      email.category === "promotion" ? "#92400e" :
                      email.category === "newsletter" ? "#1e40af" :
                      email.category === "updates" ? "#1e40af" :
                      "#334155"
                  }}
                >
                  {email.category}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.25rem 0" }}>From</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  {email.from}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.25rem 0" }}>Date</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  {email.date}
                </p>
              </div>
            </div>
          </div>

          {/* Email Body - Clean extracted text */}
          <div
            style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#334155",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              fontFamily: "inherit"
            }}
          >
            {email.cleanBody || email.body || "[No email content]"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailDetails;
