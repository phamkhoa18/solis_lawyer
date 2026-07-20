import type { Metadata } from "next";
import Footer from "./common/Footer";
import Header from "./common/Header";
import Home from "./components/Home";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Solis Lawyers offers professional legal services in migration law, criminal law, family law, and conveyancing. Trusted legal experts across Australia.",
  openGraph: {
    title: "Solis Lawyers | Professional Legal Services in Australia",
    description:
      "Trusted legal experts in migration, criminal, family law and conveyancing across Australia.",
    url: "https://solislaw.com.au",
  },
};

export default function HomePage() {
  return (
    <>
      <Header></Header>
      <Home></Home>
      <Footer></Footer>
    </>
  );
}
