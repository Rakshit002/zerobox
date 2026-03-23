import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div
      className="home-page"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
        color: "#0f172a",
      }}
    >
      <header
        className="home-navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          background: "#ffffff",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.08)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#4338ca" }}>Zerobox</div>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/" style={{ fontWeight: 600, color: "#334155", textDecoration: "none" }}>
            Home
          </Link>
          <Link to="/login" style={{ fontWeight: 600, color: "#334155", textDecoration: "none" }}>
            Login
          </Link>
        </nav>
      </header>

      <main style={{ margin: "0 auto", maxWidth: "1200px", padding: "2rem" }}>
        <section
          style={{
            background: "#ffffff",
            borderRadius: "1rem",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.1)",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "2.5rem", margin: 0, fontWeight: 800 }}>Zerobox</h1>
            <p style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "1.1rem" }}>
              Smart Email Management & Intelligence Platform
            </p>
            <p style={{ marginTop: "0.5rem", color: "#475569", fontSize: "1rem", maxWidth: "600px", margin: "0.75rem auto 0" }}>
              Take control of your inbox with AI-powered insights, smart filtering, and intuitive organization.
              Pin important messages, star favorites, and let our analytics guide you to what matters most.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              {
                title: "Email Analytics",
                description: "Understand your inbox trends and behavior.",
              },
              {
                title: "Important Email Detection",
                description: "AI-assisted priority email suggestions.",
              },
              {
                title: "Star & Pin Emails",
                description: "Quickly mark messages to follow up.",
              },
              {
                title: "Smart Inbox Experience",
                description: "Clean layout for modern email navigation.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  borderRadius: "0.75rem",
                  background: "#eef2ff",
                  padding: "1rem",
                  boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
                }}
              >
                <h3 style={{ margin: 0, color: "#3730a3" }}>{feature.title}</h3>
                <p style={{ marginTop: "0.45rem", color: "#475569", fontSize: "0.9rem" }}>{feature.description}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>How It Works</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔗</div>
                <h4 style={{ margin: 0, fontSize: "1rem" }}>Connect Gmail</h4>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Securely link your Gmail account</p>
              </div>
              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                <h4 style={{ margin: 0, fontSize: "1rem" }}>Analyze & Organize</h4>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>AI detects important emails and patterns</p>
              </div>
              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                <h4 style={{ margin: 0, fontSize: "1rem" }}>Pin & Star</h4>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Mark emails for quick access</p>
              </div>
              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                <h4 style={{ margin: 0, fontSize: "1rem" }}>Search & Filter</h4>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Find emails instantly</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.75rem", textAlign: "center" }}>
            <button
              onClick={handleLogin}
              style={{
                background: "#4338ca",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.8rem 1.4rem",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Login with Google
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
