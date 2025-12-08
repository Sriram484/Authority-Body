// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "Excellence in Education Assessment",
            subtitle: "Ensuring Quality Standards Nationwide",
          },
          slide2: {
            title: "Empowering Assessment Agencies",
            subtitle: "Building a Better Future Together",
          },
          slide3: {
            title: "Certification You Can Trust",
            subtitle: "Verified by National Authority",
          },
        },
        overviewTitle: "Overview",
        stats: {
          totalAgencies: "Total Agencies",
          activeCourses: "Active Courses",
          pendingCertificates: "Pending Certificate Requests",
          pendingClaims: "Pending Course Claims",
        },
        activity: {
          title: "Recent Activity",
          none: "No recent activity",
          types: {
            certificateRequest: "Certificate Request",
            courseClaim: "Course Claim",
          },
          status: {
            pendingReview: "Pending Review",
          },
        },
      },
    },
  },

  hi: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "शिक्षा मूल्यांकन में उत्कृष्टता",
            subtitle: "संपूर्ण देश में गुणवत्ता मानक सुनिश्चित करना",
          },
          slide2: {
            title: "मूल्यांकन एजेंसियों को सशक्त बनाना",
            subtitle: "मिलकर बेहतर भविष्य का निर्माण",
          },
          slide3: {
            title: "विश्वसनीय प्रमाण पत्र",
            subtitle: "राष्ट्रीय प्राधिकरण द्वारा सत्यापित",
          },
        },
        overviewTitle: "समीक्षा",
        stats: {
          totalAgencies: "कुल एजेंसियाँ",
          activeCourses: "सक्रिय पाठ्यक्रम",
          pendingCertificates: "लंबित प्रमाण पत्र अनुरोध",
          pendingClaims: "लंबित पाठ्यक्रम दावा",
        },
        activity: {
          title: "हाल की गतिविधि",
          none: "कोई हाल की गतिविधि नहीं",
          types: {
            certificateRequest: "प्रमाण पत्र अनुरोध",
            courseClaim: "पाठ्यक्रम दावा",
          },
          status: {
            pendingReview: "समीक्षा लंबित",
          },
        },
      },
    },
  },

  ta: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "கல்வி மதிப்பீட்டில் சிறப்பு",
            subtitle: "நாடு முழுவதும் தரநிலைகளை உறுதிப்படுத்தல்",
          },
          slide2: {
            title: "மதிப்பீட்டு நிறுவனங்களுக்கு வலுசேர்த்தல்",
            subtitle: "சேர்ந்து ஒரு சிறந்த எதிர்காலத்தை உருவாக்குவோம்",
          },
          slide3: {
            title: "நம்பிக்கைக்குரிய சான்றிதழ்",
            subtitle: "தேசிய ஆணையத்தால் சரிபார்க்கப்பட்டது",
          },
        },
        overviewTitle: "மேலோட்டம்",
        stats: {
          totalAgencies: "மொத்த நிறுவனங்கள்",
          activeCourses: "செயலில் உள்ள பாடநெறிகள்",
          pendingCertificates: "நிலுவையில் உள்ள சான்றிதழ் கோரிக்கைகள்",
          pendingClaims: "நிலுவையில் உள்ள பாடநெறி கோரிக்கைகள்",
        },
        activity: {
          title: "சமீபத்திய செயல்பாடுகள்",
          none: "சமீபத்திய செயல்பாடுகள் எதுவும் இல்லை",
          types: {
            certificateRequest: "சான்றிதழ் கோரிக்கை",
            courseClaim: "பாடநெறி கோரிக்கை",
          },
          status: {
            pendingReview: "மதிப்பாய்வில் உள்ளது",
          },
        },
      },
    },
  },

  raj: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "शिक्षा मूल्यांकन री उत्कृष्टता",
            subtitle: "पूरे भारत में गुणवत्तान कौ ध्यान",
          },
          slide2: {
            title: "मूल्यांकन एजेंसी ने मजबूती देवां",
            subtitle: "मिल कै बेहतरीन भविष्य गढ़ो",
          },
          slide3: {
            title: "भरोसेमंद प्रमाण पत्र",
            subtitle: "राष्ट्रीय प्राधिकरण सूं सत्यापित",
          },
        },
        overviewTitle: "सारांश",
        stats: {
          totalAgencies: "कुल एजेंसी",
          activeCourses: "सक्रिय कोर्स",
          pendingCertificates: "लंबित प्रमाण पत्र रिक्वेस्ट",
          pendingClaims: "लंबित कोर्स क्लेम",
        },
        activity: {
          title: "हाल री गतिविधि",
          none: "कोई हाल री गतिविधि न्हीं",
          types: {
            certificateRequest: "प्रमाण पत्र रिक्वेस्ट",
            courseClaim: "कोर्स क्लेम",
          },
          status: {
            pendingReview: "ரिव्यू लंबित",
          },
        },
      },
    },
  },
};

const savedLang =
  typeof window !== "undefined" ? localStorage.getItem("lang") : null;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
