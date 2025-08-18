/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Share2, Twitter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IMember } from '@/lib/types/imember';
import { ApiResponse } from '@/lib/types/api-response';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

// Define member data structure for rendering
interface MemberData {
  name: string;
  position: string;
  image: string;
  socialLinks: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
}

// Map IMember to MemberData based on language
const mapMemberToCard = (member: IMember, lang: 'en' | 'vi'): MemberData => {
  const name = member.name?.[lang] || 'Unnamed Member';
  const position = member.position?.[lang] || 'No Position';
  const image = member.image || '/images/fallback-user.jpg';

  // Log for debugging Vietnamese issues
  if (lang === 'vi') {
    console.log(`Member ${member._id || 'unknown'}:`, {
      name: member.name?.vi,
      position: member.position?.vi,
      image: member.image,
      socialLinks: member.socialLinks,
    });
  }

  return {
    name,
    position,
    image,
    socialLinks: {
      facebook: member.socialLinks?.facebook || '#',
      twitter: member.socialLinks?.twitter || '#',
      linkedin: member.socialLinks?.linkedin || '#',
      instagram: member.socialLinks?.instagram || '#',
    },
  };
};

export default function Team() {
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [members, setMembers] = useState<IMember[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

  // Animation variants for heading section
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for team cards
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: i * 0.2,
      },
    }),
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.4,
        ease: 'easeIn',
      },
    },
  };

  // Animation for background image
  const bgImageVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Fetch members from API
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/members');
      const data: ApiResponse<IMember[]> = await res.json();
      if (data.success && data.data) {
        console.log('API Response:', data.data);
        setMembers(data.data);
      } else {
        setError(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải thành viên' : 'Unable to load members'));
        toast.error(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải thành viên' : 'Unable to load members'));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (normalizedLanguage === 'vi' ? 'Lỗi kết nối server' : 'Server connection error');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Map members to card data using normalized language
  const memberCards = members.map((member) => mapMemberToCard(member, normalizedLanguage));

  // Map social icons to their keys
  const socialIcons = [
    { Icon: Twitter, key: 'twitter', label: 'Twitter' },
    { Icon: Facebook, key: 'facebook', label: 'Facebook' },
    { Icon: Linkedin, key: 'linkedin', label: 'LinkedIn' },
    { Icon: Instagram, key: 'instagram', label: 'Instagram' },
  ];

  return (
    <section className="team pt-20 pb-16 relative lg:mt-20">
      <motion.div
        className="absolute bottom-0 left-0 z-[-1]"
        variants={bgImageVariants}
        animate="animate"
      >
        <img src="/images/member/team.png" alt="Team background decoration" />
      </motion.div>
      <div className="container mx-auto lg:gap-28 gap-8 flex lg:flex-row flex-col justify-between px-3.5">
        <div className="lg:w-[35%] w-full">
          <div className="heading-1 flex justify-center flex-col gap-4">
            <motion.h4
              className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {normalizedLanguage === 'vi' ? 'THÀNH VIÊN' : 'TEAM MEMBER'}
            </motion.h4>
            <motion.h2
              className="font_play text-5xl leading-[1.3]"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 }}
            >
              {normalizedLanguage === 'vi' ? 'Đội ngũ tuyệt vời của chúng tôi' : 'Our awesome team members'}
            </motion.h2>
            <motion.p
              className="text-justify text-[var(--paragraph)]"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4 }}
            >
              {normalizedLanguage === 'vi'
                ? 'Chúng tôi đã tập hợp những con người, sự đổi mới và quan hệ đối tác để khám phá và vượt qua những thách thức mới.'
                : 'To explore and go after new ways to build, we’ve gathered the people, innovations, & partnerships that can anticipate & overcome new challenges.'}
            </motion.p>
            <motion.div
              className="star flex gap-3 items-center"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font_play text-5xl">5.0</h2>
              <div className="text-center">
                <img src="/images/member/five-start-icon.png" alt="Five-star rating" />
                <h6 className="text-sm font_play mt-2">
                  {normalizedLanguage === 'vi' ? '2000+ Đánh giá' : '2000+ Ratings'}
                </h6>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="lg:w-[60%] w-full">
          <div className="list-member">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="user overflow-hidden rounded-3xl bg-white border border-[rgb(0_0_0_/_10%)]"
                  >
                    <Skeleton className="w-full h-64" />
                    <div className="p-7 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center text-center">
                <div className="space-y-4">
                  <p className="text-red-500 text-lg">{error}</p>
                  <Button
                    onClick={fetchMembers}
                    className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white hover:opacity-90"
                  >
                    {normalizedLanguage === 'vi' ? 'Thử lại' : 'Try Again'}
                  </Button>
                </div>
              </div>
            ) : memberCards.length === 0 ? (
              <div className="flex items-center justify-center text-center">
                <p className="text-gray-500 text-lg">
                  {normalizedLanguage === 'vi' ? 'Không có thành viên nào đang hoạt động.' : 'No active members available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {memberCards.map((member:any, index) => (
                  <motion.div
                    key={member.name}
                    className={`user cursor-pointer group overflow-hidden rounded-3xl bg-white border border-[rgb(0_0_0_/_10%)] ${
                      index % 2 === 0 ? 'lg:-translate-y-20' : ''
                    }`}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    viewport={{ once: false, amount: 0.3 }}
                    custom={index}
                  >
                    <div
                      className="thumnail relative 
                        before:content-[''] 
                        before:absolute before:bottom-0 before:left-0 
                        before:w-full before:h-0 
                        before:opacity-50 
                        before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                        before:transition-all before:duration-700 before:ease-in-out
                        group-hover:before:h-full"
                    >
                      <img src={member.image} alt={`${member.name}'s profile`} className="w-full max-h-[380px] object-cover" />
                      <div
                        className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div
                          className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                            hoveredCard === index ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                          }`}
                        >
                          {socialIcons.map(({ Icon, key, label }, i) => (
                            member.socialLinks[key] !== '#' && (
                              <motion.div
                                key={`${member.name}-${key}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={
                                  hoveredCard === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                                }
                                transition={{ delay: hoveredCard === index ? i * 0.05 : 0 }}
                              >
                                <a href={member.socialLinks[key]} aria-label={`${member.name}'s ${label}`}>
                                  <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                                </a>
                              </motion.div>
                            )
                          ))}
                        </div>
                        <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                          <Share2 className="text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="body-text p-7">
                      <h4 className="text-xl font_play font-semibold">{member.name}</h4>
                      <span>{member.position}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}