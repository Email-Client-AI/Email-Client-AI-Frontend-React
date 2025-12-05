import { useEffect, useState } from "react";
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
// import { useAuth } from "../contexts/AuthContext";
// import { useAuth } from "../contexts/AuthContext";
import { CategoryType, type Email } from "../types/email";
import { getEmailById, getListEmails } from "../services/email-services";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  // const { user, logout } = useAuth();
  const [activeEmail, setActiveEmail] = useState<Email>();
  const [emails, setEmails] = useState<Email[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const category: CategoryType = location.hash ? location.hash.replace('#', '') : CategoryType.INBOX;

  const fetchEmails = async (pageToLoad: number) => {
    const emailPageResponse = await getListEmails(pageToLoad, 10, category);

    setEmails(emailPageResponse.emails);
    setTotalPages(emailPageResponse.totalPages);

    const detail = await getEmailById(emailPageResponse.emails[0].id);
    setActiveEmail(detail);
  };

  useEffect(() => {
    fetchEmails(page);
  }, [page, category]);

  const onEmailSelect = async (emailId: string) => {
    const currentEmailDetail = emails.find(email => email.id === emailId);
    if (currentEmailDetail?.bodyHtml) {
      setActiveEmail(currentEmailDetail);
      return;
    }
    const emailDetail = await getEmailById(emailId);
    setEmails(emails.map(email => email.id === emailId ? emailDetail : email));
    setActiveEmail(emailDetail);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 flex h-screen w-full flex-col">
      <Header activeCategory={category} />

      <div className="flex flex-1 overflow-hidden">
        <EmailList
          emails={emails}
          activeEmailId={activeEmail?.id || ""}
          onEmailSelect={onEmailSelect}

          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <EmailDetail email={activeEmail} />
      </div>
    </div>
  );
}
