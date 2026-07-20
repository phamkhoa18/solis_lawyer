import type { Metadata } from "next";
import React from 'react';
import PageTitle from '../components/PageTitle';
import Header from '../common/Header';
import About from '../components/About';
import Footer from '../common/Footer';
import Member from '../components/Member';

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Solis Lawyers — our mission, values, and expert team dedicated to providing top-tier legal services across Australia.",
  openGraph: {
    title: "About Us | Solis Lawyers",
    description:
      "Meet the Solis Lawyers team and learn about our commitment to delivering exceptional legal services.",
    url: "https://solislaw.com.au/about",
  },
};

export default function AboutPage() {
    return (
    <>
    <Header></Header>
    <section className='about'>
        <PageTitle
            title="About Us"
            backgroundImage="/images/bgbanner/page-title-bg.jpg"
            breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'About Us' },
            ]}
        />

        <About></About>
        <Member></Member>
    </section>
    <Footer></Footer>
    </>
    )
}
