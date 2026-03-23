import { useState, useCallback, useRef } from "react";
import { getEmailAnalytics, fetchEmails as fetchEmailsFromApi } from "../api/EmailApi";

/** Drop duplicate Gmail messages when merging pages (same id). */
function dedupeEmailsById(list) {
  const seen = new Set();
  return list.filter((e) => {
    if (!e?.id || seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

/**
 * Hook: analytics + paginated inbox (infinite scroll).
 * fetchEmails(null/undefined) loads first page and replaces list.
 * fetchEmails(nextPageToken) appends the next page.
 */
function useEmails() {
  const [analytics, setAnalytics] = useState({
    unreadCount: 0,
    topSender: "",
    topDomain: "",
    importantEmail: null
  });

  const [emails, setEmails] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef(null);

  const fetchEmailAnalytics = useCallback(async () => {
    const data = await getEmailAnalytics();
    setAnalytics({
      unreadCount: data.unreadCount || 0,
      topSender: data.topSender || "",
      topDomain: data.topDomain || "",
      importantEmail: data.importantEmail || null
    });
    return data;
  }, []);

  const fetchEmails = useCallback(async (pageToken, search) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await fetchEmailsFromApi(pageToken || undefined, search || undefined);
      const batch = data.emails || [];
      const token = data.nextPageToken ?? null;
      setEmails((prev) => {
        if (!pageToken) {
          return dedupeEmailsById(batch);
        }
        return dedupeEmailsById([...prev, ...batch]);
      });
      setNextPageToken(token);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEmails(null, term);
    }, 500);
  }, [fetchEmails]);

  return {
    analytics,
    importantEmail: analytics.importantEmail,
    fetchEmailAnalytics,
    emails,
    nextPageToken,
    loading,
    fetchEmails,
    searchTerm,
    handleSearch
  };
}

export default useEmails;
