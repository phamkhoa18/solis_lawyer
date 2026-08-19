import type { Metadata } from "next";
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import GetInTouch from '../components/GetInTouch';
import ServiceList from './ServiceList';
import connectDB from '@/lib/dbConnect';
import Service from '@/models/Service';
import { IService } from '@/lib/types/iservice';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Solis Lawyers' comprehensive legal services including migration law, criminal law, family law, and conveyancing in Australia.",
  openGraph: {
    title: "Our Services | Solis Lawyers",
    description:
      "Professional legal services in migration, criminal, family law and conveyancing.",
    url: "https://solislaw.com.au/services",
  },
};

async function getServices(): Promise<IService[]> {
  try {
    await connectDB();
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export default async function ServicePage() {
  const services = await getServices();

  return (
    <>
      <Header />
      <section className="services bg-gray-50 min-h-screen">
        <PageTitle
          title="Our Services"
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Services' },
          ]}
        />

        <div className="container mx-auto px-3.5 lg:py-16 py-8 flex flex-col gap-8">
          <ServiceList services={services} />

          <GetInTouch
            title="Need Legal Assistance?"
            description="Contact us today to discuss how we can support your legal needs."
          />
        </div>
      </section>
      <Footer />
    </>
  );
}