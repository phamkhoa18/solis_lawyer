import { motion, Variants } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import React, { useState } from 'react'

interface GetInTouchItem {
  title: string
  description?: string
}

const popupVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99], delay: i * 0.2 },
  }),
};

const GetInTouch: React.FC<GetInTouchItem> = ({
  title,
  description, 
}) => {


    const [isPopupOpen, setIsPopupOpen] = useState(false);
      const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
      };
    
      const validateForm = () => {
        const newErrors = { name: '', email: '', phone: '', message: '' };
        let isValid = true;
    
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
          isValid = false;
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
          isValid = false;
        }
        if (!formData.message.trim()) {
          newErrors.message = 'Message is required';
          isValid = false;
        }
    
        setErrors(newErrors);
        return isValid;
      };
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
          // Handle form submission (e.g., API call)
          console.log('Form submitted:', formData);
          setIsPopupOpen(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }
      };

  return (
    <div>
        <motion.div variants={sectionVariants}
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-2xl p-6 text-center text-white">
            <h3 className="text-xl font_play font-semibold mb-2">
                {title}
            </h3>
            <p className="text-sm mb-4">
                {description}
            </p>
            <button
                onClick={() => setIsPopupOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-[#9b6f45] px-6 py-2 rounded-full font-medium hover:bg-[#B8967E] hover:text-white transition-all duration-300"
                >
                Get in Touch <ArrowRight size={18} />
            </button>
        </motion.div>

        {/* Popup */}
        {isPopupOpen && (
            <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPopupOpen(false)}
            >
            <motion.div
                className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                onClick={() => setIsPopupOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-[#B8967E] transition-colors duration-300"
                >
                <X size={24} />
                </button>

                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-t-2xl p-4 mb-6">
                <h2 className="text-2xl font_play font-bold text-white text-center">
                    Get in Touch
                </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d5aa6d] text-sm"
                    placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d5aa6d] text-sm"
                    placeholder="Your email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                    </label>
                    <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d5aa6d] text-sm"
                    placeholder="Your phone number"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d5aa6d] text-sm h-32 resize-none"
                    placeholder="Your message"
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white px-6 py-3 rounded-full font-medium hover:from-[#B8967E] hover:to-[#9b6f45] transition-all duration-300"
                >
                    Send Message
                </button>
                </form>
            </motion.div>
            </motion.div>
        )}
    </div>
  )
}



export default GetInTouch
  