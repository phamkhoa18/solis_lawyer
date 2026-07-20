import type { Metadata } from "next";
import React from 'react';
import Header from '../common/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../common/Footer';
import ContactPage from '../components/ContactPage';

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Solis Lawyers for expert legal advice. Contact us for migration law, criminal law, family law, and conveyancing services in Australia.",
  openGraph: {
    title: "Contact Us | Solis Lawyers",
    description:
      "Reach out to Solis Lawyers for professional legal consultation and services.",
    url: "https://solislaw.com.au/contact",
  },
};

export default function Contact() {
  return (
    <>
      <Header />
      <section className="bg-gray-50 min-h-screen">
        <PageTitle
          title="Contact Us"
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Contact Us' },
          ]}
        />

          <ContactPage></ContactPage>
      </section>
      <Footer />
    </>
  );
}