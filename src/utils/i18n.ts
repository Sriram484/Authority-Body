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
          typeCertificate: "Certificate Request",
          typeCourseClaim: "Course Claim",
          statusPending: "Pending Review",
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
          typeCertificate: "प्रमाण पत्र अनुरोध",
          typeCourseClaim: "पाठ्यक्रम दावा",
          statusPending: "समीक्षा लंबित",
        },
      },
    },
  },

  mrw: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "शिक्षा आकलन में बेस्ट",
            subtitle: "पूरे देस में क्वालिटी राखां",
          },
          slide2: {
            title: "आकलन एजेंसी ने सशक्त बनावां",
            subtitle: "मिलकै भविष्य ने नीको बनावां",
          },
          slide3: {
            title: "भरोसोमंद सर्टिफिकेट",
            subtitle: "रास्ट्रीय अथॉरिटी सूं पक्का",
          },
        },
        overviewTitle: "ओवरव्यू",
        stats: {
          totalAgencies: "कुल एजेंसी",
          activeCourses: "एक्टिव कोर्स",
          pendingCertificates: "लंबित सर्टिफिकेट रिक्वेस्ट",
          pendingClaims: "लंबित कोर्स क्लेम",
        },
        activity: {
          title: "हाल की हलचल",
          none: "अभी कोई हलचल नायं",
          typeCertificate: "सर्टिफिकेट रिक्वेस्ट",
          typeCourseClaim: "कोर्स क्लेम",
          statusPending: "रिव्यू में",
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
          typeCertificate: "प्रमाण पत्र रिक्वेस्ट",
          typeCourseClaim: "कोर्स क्लेम",
          statusPending: "रिव्यू लंबित",
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
