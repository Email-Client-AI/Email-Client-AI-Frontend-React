import { useEffect, useState } from "react";
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
// import { useAuth } from "../contexts/AuthContext";
// import { useAuth } from "../contexts/AuthContext";
import type { Email } from "../types/email";
import { getEmailById, getListEmails } from "../services/email-services";

export default function Dashboard() {
  // const { user, logout } = useAuth();
  const [activeEmail, setActiveEmail] = useState<Email>();
  const [emails, setEmails] = useState<Email[]>([]);
  useEffect(() => {
    const fetchEmails = async () => {
      const emailPageResponse = await getListEmails();
      setEmails(emailPageResponse.emails);
      const emailDetail = await getEmailById(emailPageResponse.emails[0].id);
      setActiveEmail(emailDetail);
    };
    fetchEmails();
  }, []);

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
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <EmailList 
          emails={emails} 
          activeEmailId={activeEmail?.id || ""} 
          onEmailSelect={onEmailSelect} 
        />

        <EmailDetail email={activeEmail} />
      </div>
    </div>
  );
}
