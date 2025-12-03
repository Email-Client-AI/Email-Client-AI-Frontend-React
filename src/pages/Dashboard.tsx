import { useState } from "react";
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
// import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  // const { user, logout } = useAuth();
  const [activeEmail, setActiveEmail] = useState<number>(1);

  interface Email {
    id: number;
    name: string;
    time: string;
    subject: string;
    snippet: string;
    avatar: string;
  }
  
  // Dummy Data
  const emails: Email[] = [
    { id: 1, name: "Olivia Rhye", time: "2m ago", subject: "Project Update", snippet: "Hi Olivia, I'm reaching out to discuss th...", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAplEOTJB-QpUVkYx1LC6vuttOizHPnD76SHegZUoxox_H6MSelZhp5WNbBE9ViAfa0B8bG_vyltiOLd2l3A3Q3Z8_eqDwiDSVSNHyNyZ7CT1Dn8VQIjknxvSGnsV-z6AVjLhtuzDMWwCqZanQv50_g2m22HukOq0oJ042ehMzvBFF3_JztV99iMjOmHSw41IpIHyU47R2HP25zMlr3XitvoSVssJJ7irCTmyoj5p5u2RNp9ADU3A3HPrIYCrjORazg5mfPzkqIw5o" },
    { id: 2, name: "Phoenix Baker", time: "1h ago", subject: "Marketing Report", snippet: "Dear Team, Please find attached the lat...", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAplEOTJB-QpUVkYx1LC6vuttOizHPnD76SHegZUoxox_H6MSelZhp5WNbBE9ViAfa0B8bG_vyltiOLd2l3A3Q3Z8_eqDwiDSVSNHyNyZ7CT1Dn8VQIjknxvSGnsV-z6AVjLhtuzDMWwCqZanQv50_g2m22HukOq0oJ042ehMzvBFF3_JztV99iMjOmHSw41IpIHyU47R2HP25zMlr3XitvoSVssJJ7irCTmyoj5p5u2RNp9ADU3A3HPrIYCrjORazg5mfPzkqIw5o" },
    { id: 3, name: "Lana Steiner", time: "4h ago", subject: "Order Confirmation", snippet: "Hello, Your order has been shipped and...", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0NYhGixWIvQb0j5bme5444cNZuhYSZHoIM9ikGrb95NJtVdclOL6uYE-0VIL7HrqhwxpiA4MqyKA4ODI9zT0fnXm1jgkjKcr6XzQHDnJHlzxm5RtQuO2knqE4N3LiduXZMp95eaCmAGxL7DqPy6N2Ym3xMfgeSZCZ6Aygoaab9zjPmzvLU8ErdbQATh-H1nLp7RLZbbWExN9SG53xUdJZ6TBQawaj5w0LWWyDO4hHO8ufPgrRJgodzRE5ccQyfBILk05Jzx1o-Tg" },
    { id: 4, name: "Ethan Hunt", time: "Yesterday", subject: "Proposal Review", snippet: "Hi Ethan, I've reviewed your proposal a...", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuhjLeDsYSBfb2vBrZKoKelkA9aRrI3y53_NaDH3yufCSyRrD2uMdXo47pJq2_-gcxVLRw85Izhb0DWvnXuAzbxqwJQg6Yfu_txi1VfoZ0GioKv85UsvjwkC0PwXSWbVEHF2TzVHoR4cDQ96V1jAhPUMkU9PqpjKvW1eAMly4zPR8B1KsUJ2c1WcE6tERvhjWGKEzyhzWbTiaYiJ4k8CaJz4lotT0OxnCQ1u5uU2vJDBdEjOl7qM6pfqpYpU7AaPSKjCpEwyE53Eo" },
    { id: 5, name: "Candice Wu", time: "2 days ago", subject: "Product Launch", snippet: "Dear Customer, We're excited to annou...", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwOgVGofLzM02ig4Xi9u7H6ps8gjLd1HDp89ilz3vt7eg1yxk3kmacf0mU7GfqmI5nBpbWxD-y09yCf16gBy4TzVS7mJjKahtMVL3slNDOIa-Y4V1vXlp4xBlRauJcYVJ8NwvBEP5q9FUhcoZ3ztb3XckiYgWMM6YWup-oH70-rFqCAgSNtCp6UFSbxb4IjvKI0AME_MJabmGdc4i8fwdVATVYy6_WTxaCemYS0Kx7_xvO0KeJLcBZFPMDUcwXtDG01zuaW5jhIq8" },
  ];

  const selectedEmail = emails.find(e => e.id === activeEmail) || emails[0];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 flex h-screen w-full flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <EmailList 
          emails={emails} 
          activeEmail={activeEmail} 
          onEmailSelect={setActiveEmail} 
        />

        <EmailDetail email={selectedEmail} />
      </div>
    </div>
  );
}
