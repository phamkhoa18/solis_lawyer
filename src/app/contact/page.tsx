import React from 'react';
import Header from '../common/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';

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

        <div className="container mx-auto px-4 lg:py-16 py-8">
          {/* Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Information */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Building2 className="h-8 w-8 text-[#d5aa6d]" />
                    <h3 className="font-serif text-2xl text-gray-900">
                      Legal Firm A
                    </h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#9b6f45]" />
                      <p>
                        123 Justice Avenue, Suite 500, Ho Chi Minh City, Vietnam
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[#9b6f45]" />
                      <p>+84 123 456 789</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#9b6f45]" />
                      <p>contact@legalfirma.vn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Building2 className="h-8 w-8 text-[#d5aa6d]" />
                    <h3 className="font-serif text-2xl text-gray-900">
                      Legal Firm B
                    </h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#9b6f45]" />
                      <p>456 Law Street, District 1, Hanoi, Vietnam</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[#9b6f45]" />
                      <p>+84 987 654 321</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#9b6f45]" />
                      <p>info@legalfirmb.vn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="border-none py-2 flex flex-col justify-center shadow-xl bg-white rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <h4 className="bg-gradient-to-r mb-4 from-[#d5aa6d] font-serif to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-2xl text-center font-semibold">
                    Send Us a Message
                </h4>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        className="mt-2 border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 rounded-lg py-3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        className="mt-2 border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 rounded-lg py-3"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      className="mt-2 border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 rounded-lg py-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="How can we assist you?"
                      className="mt-2 border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 rounded-lg py-3 min-h-[140px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#b8975b] hover:to-[#8a623d] text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}