import React from 'react';
import Header from '../common/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../common/Footer';
import ContactPage from '../components/ContactPage';


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