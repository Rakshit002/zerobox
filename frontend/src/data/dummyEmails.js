/**
 * Dummy data shaped exactly like backend API response.
 * TODO: Replace with data from GET /api/emails/inbox
 */
export const dummyEmailsData = {
  domains: [
    {
      domain: "google.com",
      emails: [
        {
          id: "1",
          from: "security@google.com",
          subject: "Security Alert",
          snippet: "New sign-in detected",
          body: "We detected a new sign-in to your Google account. If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.",
          date: "2026-02-01",
          unread: true,
          starred: false,
          pinned: false
        },
        {
          id: "2",
          from: "team@google.com",
          subject: "Google Cloud Credits",
          snippet: "Your credits are ready",
          body: "Your Google Cloud free trial credits have been activated. Start building your applications today with $300 in free credits.",
          date: "2026-02-02",
          unread: false,
          starred: true,
          pinned: false
        }
      ]
    },
    {
      domain: "github.com",
      emails: [
        {
          id: "3",
          from: "notifications@github.com",
          subject: "Pull Request merged",
          snippet: "Your PR was merged into main",
          body: "Your pull request 'Add user authentication' has been successfully merged into the main branch. Great work!",
          date: "2026-02-03",
          unread: true,
          starred: false,
          pinned: true
        }
      ]
    }
  ]
};
