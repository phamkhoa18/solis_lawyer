"use client"

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, Award, Users, Briefcase } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string;
  specialties: string[];
  education?: string;
  experience: string;
  image: string;
  email?: string;
  phone?: string;
}

interface TeamContent {
  sectionTitle: string;
  sectionSubtitle: string;
  teamMembers: TeamMember[];
  specialtiesLabel: string;
  educationLabel: string;
  experienceLabel: string;
  contactLabel: string;
}

const content: Record<'VI' | 'EN', TeamContent> = {
  VI: {
    sectionTitle: "ĐỘI NGŨ CHUYÊN GIA",
    sectionSubtitle: "Gặp gỡ đội ngũ luật sư giàu kinh nghiệm và tận tâm của chúng tôi",
    specialtiesLabel: "Chuyên môn",
    educationLabel: "Học vấn",
    experienceLabel: "Kinh nghiệm",
    contactLabel: "Liên hệ",
    teamMembers: [
      {
        id: "founder",
        name: "Luật sư Nguyễn Thành Lê",
        position: "Nhà sáng lập và Luật sư trưởng",
        description: "Luật sư Nguyễn Thành Lê là người sáng lập Solis Lawyers, sở hữu hơn mười năm kinh nghiệm hành nghề cùng uy tín vững chắc trong giới luật tại Úc. Trong suốt sự nghiệp, ông đã trực tiếp tham gia và bảo vệ thành công cho nhiều thân chủ trong các vụ án trọng điểm và phức tạp, từ những vụ án hình sự nghiêm trọng đến các hồ sơ pháp lý đặc thù, nhạy cảm. Bên cạnh lĩnh vực luật hình sự, Luật sư Nguyễn Thành Lê còn có bề dày kinh nghiệm trong việc tham gia các phiên tòa kháng cáo di trú, giúp khách hàng bảo vệ quyền lợi và mở ra cơ hội mới tại Úc.",
        specialties: ["Luật Hình Sự", "Luật Di Trú", "Luật Gia Đình", "Kháng Cáo Tòa Án", "Phân Chia Tài Sản", "Quyền Nuôi Con"],
        experience: "Hơn 10 năm kinh nghiệm hành nghề tại Úc",
        image: "/images/about/thanhnguyen.jpg",
      },
      {
        id: "director",
        name: "Ms. Duong Bella Nguyen",
        position: "Giám Đốc Việt Nam & Quản Lý Trưởng Sydney",
        description: "Ms. Duong Bella Nguyen hiện là Giám đốc Solis Lawyers Việt Nam đồng thời đảm nhiệm vai trò Quản lý trưởng tại trụ sở chính Sydney. Với nền tảng chuyên môn vững chắc cùng nhiều năm kinh nghiệm trong lĩnh vực pháp lý và quản lý, bà giữ vai trò trọng yếu trong việc định hướng phát triển chiến lược, kết nối và điều phối hoạt động của hệ thống Solis Lawyers tại Úc và Việt Nam. Bà Bella không chỉ được biết đến với kỹ năng quản lý hiệu quả mà còn nổi bật với chuyên môn pháp lý cao cấp, đặc biệt trong việc giải quyết các vụ việc khó khăn, phức tạp và nhạy cảm.",
        specialties: ["Luật Di Trú", "Luật Hình Sự", "Luật Gia Đình", "Quản Lý Chiến Lược", "Tư Vấn Doanh Nghiệp", "Đầu Tư"],
        experience: "Nhiều năm kinh nghiệm quản lý và pháp lý",
        image: "/images/about/bella.jpg",
      },
      {
        id: "associate",
        name: "Luật sư Nguyễn Thành Tô",
        position: "Luật sư cộng sự và Tiến sĩ Luật",
        description: "Luật sư Nguyễn Thành Tô là Tiến sĩ Luật tốt nghiệp tại Đại học RMIT, Úc, với nhiều năm kinh nghiệm hành nghề trong lĩnh vực pháp lý. Ông có chuyên môn sâu rộng trong luật hình sự và luật gia đình, từng tham gia giải quyết nhiều vụ việc phức tạp, đòi hỏi sự phân tích chặt chẽ và khả năng bảo vệ quyền lợi khách hàng ở mức cao nhất. Từ năm 2023, Luật sư Nguyễn Thành Tô chính thức cộng tác cùng Solis Lawyers, dưới sự dẫn dắt của Luật sư trưởng Nguyễn Thành Lê.",
        specialties: ["Luật Hình Sự", "Luật Gia Đình", "Phân Tích Pháp Lý", "Tư Vấn Khách Hàng", "Bảo Vệ Quyền Lợi", "Giải Pháp Thiết Thực"],
        education: "Tiến sĩ Luật - Đại học RMIT, Úc",
        experience: "Nhiều năm kinh nghiệm, cộng tác từ 2023",
        image: "/images/about/thanhto.jpg",
      },
      {
        id: "nick_le",
        name: "Luật sư Nghĩa Lê",
        position: "Luật Sư",
        description: "Nghĩa Lê sinh ra tại Việt Nam và sang Úc với một quyết tâm lớn là phải thành công. Chính sự thấu hiểu sâu sắc về các giá trị gia đình, sự khác biệt văn hóa cũng như những khó khăn khi hòa nhập với môi trường mới đã nuôi dưỡng trong anh niềm đam mê gắn bó với mảng luật gia đình. Nick tốt nghiệp ngành Luật và Kinh doanh tại Đại học Western Sydney, tạo một nền tảng vững chắc cho sự nghiệp. Anh từng có thời gian rèn luyện tay nghề thực tế tại Solis Lawyers dưới sự hướng dẫn tận tình của Luật sư Trưởng Lyndon Nguyen. Sau khi chính thức được công nhận là Luật sư của Tòa án Tối cao bang New South Wales, Nick tiếp tục đồng hành và hợp tác chiến lược cùng Solis Lawyers. Với mục tiêu trở thành một luật sư gia đình giỏi, Nick luôn áp dụng phương châm làm việc cốt lõi của Solis Lawyers vào thực tế: bảo vệ khách hàng một cách tỉ mỉ, hiệu quả và sát với thực tế của các gia đình hiện đại ngày nay. Anh luôn hết lòng đồng hành cùng khách hàng vượt qua những giai đoạn khó khăn như ly thân, ly hôn hay tổ chức lại cuộc sống gia đình. Nick tập trung vào việc tìm kiếm những giải pháp công bằng nhất khi phân chia tài sản, dàn xếp các thỏa thuận tài chính và xây dựng kế hoạch nuôi dạy con cái ổn định cho tương lai. Bằng tư duy phân tích nhạy bén cùng sự chuẩn bị kỹ lưỡng, anh bảo vệ tối đa lợi ích của khách hàng cả trong lẫn ngoài tòa án, khéo léo chuyển hóa những áp lực mệt mỏi về mặt cảm xúc thành những giải pháp pháp lý rõ ràng, nhẹ nhàng và vững chắc. Một lợi thế rất lớn của Nick là khả năng nói lưu loát cả tiếng Anh lẫn tiếng Việt. Sự nhạy bén về ngôn ngữ này giúp anh dễ dàng thấu hiểu những khác biệt về văn hóa, xóa bỏ các rào cản pháp lý phức tạp và không để xảy ra bất kỳ khoảng cách nào trong giao tiếp. Nhờ có thể tư vấn một cách trực tiếp, rõ ràng và thông suốt, Nick luôn tự tin là chỗ dựa pháp lý vững chắc và bảo vệ quyền lợi tốt nhất cho cộng đồng người Việt.",
        specialties: ["Luật Gia Đình", "Ly Thân & Ly Hôn", "Phân Chia Tài Sản", "Quyền Nuôi Con"],
        education: "Luật và Kinh doanh - Đại học Western Sydney, Úc",
        experience: "Luật sư của Tòa án Tối cao bang New South Wales",
        image: "/images/about/nick_le.jpeg",
      },
      {
        id: "camvan_york",
        name: "Luật sư Cẩm Vân",
        position: "Luật Sư",
        description: "Luật sư Cẩm Vân tốt nghiệp cử nhân Luật tại Đại học Western Sydney (Western Sydney University) – một nền tảng học thuật vững chắc tạo tiền đề cho sự nghiệp pháp lý thành công của bà. Hiện nay, bà đảm nhiệm vị trí Luật sư Điều hành (Managing Lawyer) tại văn phòng Bankstown của Solis Lawyers. Tại Solis Lawyers, Luật sư Cẩm Vân là chuyên gia tư vấn và tranh tụng trong các lĩnh vực trọng tâm bao gồm: Luật Hình sự, Luật Gia đình, Di chúc & Thừa kế, cùng dịch vụ Tư vấn Pháp lý chuyên sâu cho khách hàng. Trong mảng Luật Gia đình, bà dành nhiều tâm huyết hỗ trợ khách hàng giải quyết các vấn đề phức tạp về quyền nuôi con (child custody) và thỏa thuận phân chia tài sản (property settlements). Bà đặc biệt có bề dày kinh nghiệm thực chiến trong việc bảo vệ quyền lợi khách hàng ở các vụ án bạo lực gia đình và thủ tục lệnh cấm bạo lực (AVO proceedings). Bên cạnh đó, bà cũng là người cố vấn tin cậy giúp khách hàng hoạch định tài sản, lập di chúc và xử lý các thủ tục thừa kế một cách chặt chẽ, rõ ràng. Bám sát phương châm làm việc cốt lõi của Solis Lawyers, Luật sư Cẩm Vân luôn tiếp cận từng vụ việc với tư duy phân tích nhạy bén, chiến lược tranh tụng tỉ mỉ và sự tận tụy trong từng buổi tư vấn. Khả năng lắng nghe, thấu hiểu tâm lý kết hợp với bản lĩnh tại tòa án giúp bà khéo léo chuyển hóa những áp lực mệt mỏi về mặt cảm xúc thành những giải pháp pháp lý vững chắc, bảo vệ tối đa quyền và lợi ích hợp pháp cho khách hàng.",
        specialties: ["Luật Hình Sự", "Luật Gia Đình", "Di Chúc & Thừa Kế", "Quyền Nuôi Con", "Phân Chia Tài Sản", "Lệnh Cấm Bạo Lực (AVO)"],
        education: "Cử nhân Luật - Đại học Western Sydney, Úc",
        experience: "Luật sư Điều hành tại văn phòng Bankstown, Solis Lawyers",
        image: "/images/about/van.jpg",
      }
    ]
  },
  EN: {
    sectionTitle: "OUR EXPERT TEAM",
    sectionSubtitle: "Meet our experienced and dedicated team of legal professionals",
    specialtiesLabel: "Specialties",
    educationLabel: "Education",
    experienceLabel: "Experience",
    contactLabel: "Contact",
    teamMembers: [
      {
        id: "founder",
        name: "Solicitor Thanh Le Nguyen",
        position: "Founder & Principal Lawyer",
        description: "Mr. Thanh Le Nguyen is the founder of Solis Lawyers, with more than a decade of professional experience and a strong reputation in the Australian legal community. Throughout his career, he has represented and successfully defended numerous clients in serious and complex cases, ranging from major criminal matters to sensitive and highly specialized legal proceedings. Beyond his expertise in criminal law, Lawyer Thanh Le Nguyen has extensive experience in immigration appeal hearings, where he has helped clients safeguard their rights and pursue new opportunities in Australia.",
        specialties: ["Criminal Law", "Immigration Law", "Family Law", "Court Appeals", "Property Settlements", "Child Custody"],
        experience: "Over 10 years of professional experience in Australia",
        image: "/images/about/thanhnguyen.jpg",
      },
      {
        id: "director",
        name: "Ms. Duong Bella Nguyen",
        position: "Director Vietnam & General Manager Sydney",
        description: "Ms. Duong Bella Nguyen is the Director of Solis Lawyers Vietnam and General Manager of the Sydney Head Office. With her strong leadership and advanced professional expertise, she plays a key role in shaping the firm's strategic direction and ensuring seamless coordination across its international network. She is recognized not only for her outstanding management skills but also for her high-level legal expertise, particularly in navigating and resolving difficult and complex cases.",
        specialties: ["Immigration Law", "Criminal Law", "Family Law", "Strategic Management", "Corporate Consulting", "Investment"],
        experience: "Many years of management and legal experience",
        image: "/images/about/bella.jpg",
      },
      {
        id: "associate",
        name: "Solicitor Thanh To Nguyen",
        position: "Associate & PhD in Law",
        description: "Thanh To Nguyen, PhD in Law from RMIT University, Australia, brings many years of legal practice and a wealth of expertise in criminal law and family law. Throughout his career, he has been involved in handling complex cases that demand both rigorous legal analysis and a strong commitment to protecting clients' rights. Since 2023, Lawyer Thanh To Nguyen has been a valued member of Solis Lawyers, working under the leadership of Principal Lawyer Thanh Le Nguyen.",
        specialties: ["Criminal Law", "Family Law", "Legal Analysis", "Client Consultation", "Rights Protection", "Practical Solutions"],
        education: "PhD in Law - RMIT University, Australia",
        experience: "Many years of experience, collaborating since 2023",
        image: "/images/about/thanhto.jpg",
      },
      {
        id: "nick_le",
        name: "Solicitor Nick Le",
        position: "Solicitor",
        description: "Nick Le was born in Vietnam and came to Australia with a relentless drive to succeed. His deep understanding of diverse cultural dynamics, family values, and the challenges of adapting to new environments has led to his unwavering interest in family law. Nick completed his legal and business education at Western Sydney University, laying a formidable foundation for his career. He honed his practical skills at Solis Lawyers, working closely under the firm's Principal Solicitor, Lyndon Nguyen. Now admitted as a Solicitor of the Supreme Court of New South Wales, Nick continues to collaborate strategically with Solis Lawyers. Driven to excel in family law, Nick anchors his practice in the core strategic approach of Solis Lawyers: delivering meticulous, results-driven advocacy tailored to modern family dynamics. He is deeply committed to guiding clients through the complexities of separations, divorce, and domestic relationship restructuring. Nick focuses on securing equitable outcomes in property matters, financial settlements, and forward-looking parenting arrangements. By combining a sharp analytical framework with strong tactical foresight, he protects client interests both inside and outside the courtroom, smoothly transforming complex emotional challenges into structured, legally sound resolutions. Nick can speak both English and Vietnamese fluently. This dual-language capability serves as a powerful strategic asset, allowing him to bridge cultural nuances, dismantle complex legal barriers, and eliminate communication gaps. By offering direct, clear, and unhindered legal counsel, Nick confidently advocates for the Vietnamese community.",
        specialties: ["Family Law", "Separations & Divorce", "Property Settlements", "Parenting Arrangements"],
        education: "Law and Business - Western Sydney University, Australia",
        experience: "Admitted as a Solicitor of the Supreme Court of New South Wales",
        image: "/images/about/nick_le.jpeg",
      },
      {
        id: "camvan_york",
        name: "Solicitor Cam Van York",
        position: "Solicitor",
        description: "Cam Van York completed her Bachelor of Laws at Western Sydney University, establishing a formidable academic foundation for her legal career. She currently serves as the Managing Lawyer at Solis Lawyers' Bankstown office. At Solis Lawyers, CamVan focuses her practice on Criminal Law, Family Law, Wills & Estates, and Strategic Client Consultation. Within Family Law, she is deeply committed to guiding clients through the intricacies of child custody arrangements and property settlements. She brings extensive hands-on experience in court representation, with particular expertise in defending clients in domestic violence matters and Apprehended Violence Order (AVO) proceedings. Additionally, she acts as a trusted advisor in estate planning, helping clients structure secure wills and navigate complex estate administration. Anchoring her practice in the core strategic approach of Solis Lawyers, CamVan combines sharp analytical foresight with a personalized, empathetic consultation style. Whether negotiating out-of-court solutions or advocating in front of a judge, she protects her clients' paramount interests with meticulous precision, smoothly transforming complex emotional challenges into structured, legally sound resolutions.",
        specialties: ["Criminal Law", "Family Law", "Wills & Estates", "Child Custody", "Property Settlements", "AVO Proceedings"],
        education: "Bachelor of Laws - Western Sydney University, Australia",
        experience: "Managing Lawyer at Solis Lawyers' Bankstown office",
        image: "/images/about/van.jpg",
      }
    ]
  }
};

export default function Team() {
  const { language } = useLanguage();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const currentContent = content[language];

  const openModal = (cardId: string) => {
    setExpandedCard(cardId);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setExpandedCard(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const imageVariants: Variants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="team py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">

      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-[#d5aa6d]/10 to-[#9b6f45]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-[#d5aa6d]/5 to-[#9b6f45]/5 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-3.5 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold mb-4">
            {currentContent.sectionTitle}
          </h4>
          <h2 className="font_play text-4xl lg:text-5xl leading-tight text-[var(--heading-color)] mb-6">
            {currentContent.sectionSubtitle}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] mx-auto rounded-full"></div>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 lg:gap-10"
        >
          {currentContent.teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#d5aa6d]/30 relative"
            >

              {/* Mobile Click Handler */}
              <div
                className="lg:hidden absolute inset-0 z-10 cursor-pointer"
                onClick={() => openModal(member.id)}
              />

              {/* Image Section */}
              <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <motion.div
                  variants={imageVariants}
                  className="absolute inset-0"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      // Fallback khi ảnh không load được
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div className="hidden w-full h-full bg-gradient-to-br from-[#d5aa6d]/20 to-[#9b6f45]/20 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Users size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">Photo Placeholder</p>
                      <p className="text-xs">{member.name}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content Section */}
              <div className="p-6 lg:p-8 relative">

                {/* Name & Position */}
                <div className="mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-[var(--heading-color)] mb-2 group-hover:text-[#d5aa6d] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-[#d5aa6d] font-semibold text-sm lg:text-base tracking-wide">
                    {member.position}
                  </p>
                </div>

                {/* Description */}
                <div className="relative mb-6">
                  <p className="text-[var(--paragraph)] leading-relaxed text-sm lg:text-base line-clamp-4">
                    {member.description}
                  </p>

                  {/* Mobile Tap Indicator */}
                  <div className="lg:hidden absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-8 pr-2 py-1">
                    <span className="text-xs text-[#d5aa6d] font-medium">
                      {language === 'VI' ? 'Xem thêm' : 'Read more'}
                    </span>
                  </div>
                </div>

                {/* Desktop Hover Overlay */}
                <div className="hidden lg:block absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 ease-out transform scale-95 group-hover:scale-100 z-20 border border-[#d5aa6d]/20 shadow-2xl">
                  <div className="h-full overflow-y-auto">
                    <div className="mb-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-[#d5aa6d] mb-2">
                        {member.name}
                      </h3>
                      <p className="text-[#9b6f45] font-semibold text-sm lg:text-base tracking-wide">
                        {member.position}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[var(--heading-color)] leading-relaxed text-base lg:text-lg font-medium">
                        {member.description}
                      </p>

                      <div className="pt-4 border-t border-[#d5aa6d]/20">
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white text-xs font-medium rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialties - Show ALL specialties */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={16} className="text-[#d5aa6d]" />
                    <h4 className="font-semibold text-[var(--heading-color)] text-sm">
                      {currentContent.specialtiesLabel}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-[#d5aa6d]/10 to-[#9b6f45]/10 text-[#9b6f45] text-xs font-medium rounded-full border border-[#d5aa6d]/20"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                {member.education && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={14} className="text-[#d5aa6d]" />
                      <span className="font-semibold text-[var(--heading-color)] text-sm">
                        {currentContent.educationLabel}:
                      </span>
                    </div>
                    <p className="text-[var(--paragraph)] text-xs lg:text-sm">
                      {member.education}
                    </p>
                  </div>
                )}

                {/* Experience */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-[#d5aa6d]" />
                    <span className="font-semibold text-[var(--heading-color)] text-sm">
                      {currentContent.experienceLabel}:
                    </span>
                  </div>
                  <p className="text-[var(--paragraph)] text-xs lg:text-sm font-medium">
                    {member.experience}
                  </p>
                </div>

                {/* Contact Info */}
                {/* <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-[var(--heading-color)] text-sm mb-3 flex items-center gap-2">
                    <Mail size={14} className="text-[#d5aa6d]" />
                    {currentContent.contactLabel}
                  </h4>
                  <div className="space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-xs lg:text-sm text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300"
                      >
                        <Mail size={12} />
                        <span>{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-xs lg:text-sm text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300"
                      >
                        <Phone size={12} />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                </div> */}

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#d5aa6d]/5 to-[#9b6f45]/5 rounded-2xl p-8 lg:p-12 border border-[#d5aa6d]/10">
            <h3 className="text-2xl lg:text-3xl font_play text-[var(--heading-color)] mb-4">
              {language === 'VI'
                ? 'Cần hỗ trợ pháp lý chuyên nghiệp?'
                : 'Need Professional Legal Support?'
              }
            </h3>
            <p className="text-[var(--paragraph)] mb-6 max-w-2xl mx-auto leading-relaxed">
              {language === 'VI'
                ? 'Đội ngũ luật sư giàu kinh nghiệm của chúng tôi sẵn sàng hỗ trợ bạn trong mọi vấn đề pháp lý, từ đơn giản đến phức tạp.'
                : 'Our experienced legal team is ready to support you with all legal matters, from simple to complex cases.'
              }
            </p>
            <a
              href="/contact"
              className="inline-block bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
            >
              {language === 'VI' ? 'Liên Hệ Ngay' : 'Contact Us Now'}
            </a>
          </div>
        </motion.div>

      </div>

      {/* Mobile Full Screen Modal */}
      {expandedCard && (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto relative shadow-2xl">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-[#d5aa6d] text-white rounded-full flex items-center justify-center hover:bg-[#9b6f45] transition-colors duration-300 text-xl font-bold z-10"
              onClick={closeModal}
            >
              ×
            </button>

            {/* Modal Content */}
            {(() => {
              const member = currentContent.teamMembers.find(m => m.id === expandedCard);
              if (!member) return null;

              return (
                <div className="pr-12">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#d5aa6d] mb-2">
                      {member.name}
                    </h3>
                    <p className="text-[#9b6f45] font-semibold text-base tracking-wide">
                      {member.position}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[var(--heading-color)] leading-relaxed text-base font-medium">
                      {member.description}
                    </p>

                    {/* Specialties */}
                    <div>
                      <h4 className="font-semibold text-[var(--heading-color)] mb-3 flex items-center gap-2">
                        <Award size={16} className="text-[#d5aa6d]" />
                        {currentContent.specialtiesLabel}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-2 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white text-sm font-medium rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    {member.education && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={16} className="text-[#d5aa6d]" />
                          <span className="font-semibold text-[var(--heading-color)]">
                            {currentContent.educationLabel}:
                          </span>
                        </div>
                        <p className="text-[var(--paragraph)]">
                          {member.education}
                        </p>
                      </div>
                    )}

                    {/* Experience */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-[#d5aa6d]" />
                        <span className="font-semibold text-[var(--heading-color)]">
                          {currentContent.experienceLabel}:
                        </span>
                      </div>
                      <p className="text-[var(--paragraph)] font-medium">
                        {member.experience}
                      </p>
                    </div>

                    {/* Contact */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-[var(--heading-color)] mb-3 flex items-center gap-2">
                        <Mail size={16} className="text-[#d5aa6d]" />
                        {currentContent.contactLabel}
                      </h4>
                      <div className="space-y-3">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-3 text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300"
                          >
                            <Mail size={16} />
                            <span>{member.email}</span>
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-3 text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300"
                          >
                            <Phone size={16} />
                            <span>{member.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </section>
  );
}