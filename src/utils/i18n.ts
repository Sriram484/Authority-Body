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
            subtitle: "Verified by National Awarding",
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

      certificateRequests: {
        title: "Certificate Requests",
        loading: "Loading certificate requests…",
        errorPrefix: "Error",
        exportCsv: "Export CSV",

        searchPlaceholder: "Search by student, course, agency or ID...",
        filters: {
          statusLabel: "Status",
          all: "All",
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          withdrawn: "Withdrawn",
        },

        table: {
          student: "Student",
          course: "Course",
          agency: "Agency",
          submitted: "Submitted",
          status: "Status",
          actions: "Actions",
          unknownStudent: "Unknown student",
          idLabel: "ID:",
          userIdLabel: "User ID:",
          empty: "—",
          view: "View",
        },

        modal: {
          titleFallback: "Certificate Request",
          requestId: "Request ID",
          status: "Status",
          student: "Student",
          course: "Course",
          courseIdLabel: "ID:",
          agency: "Agency",
          agencyUserIdLabel: "User ID:",
          submittedAt: "Submitted At",
          justification: "Justification",
          attachments: "Attachments",
          noAttachments: "No attachments",
          attachmentFallbackName: "Attachment",
          viewAttachment: "View",
          remarks: "Remarks",
          approve: "Approve",
          reject: "Reject",
        },

        statusBadge: {
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          withdrawn: "Withdrawn",
        },

        pagination: {
          showing: "Showing {{from}}-{{to}} of {{total}}",
          pageOf: "Page {{page}} of {{totalPages}}",
        },

        alerts: {
          docIdMissing: "Document ID missing.",
          attachmentNotFound: "Attachment not found.",
          noFileData: "No file data available.",
          loadAttachmentFailed: "Failed to load attachment.",
          remarksRequired: "Please provide remarks before rejecting",
          approveFailed: "Failed to approve: {{message}}",
          rejectFailed: "Failed to reject: {{message}}",
        },
      },

      courseClaims: {
        title: "Course Claim Requests",
        loading: "Loading course claim requests…",
        errorPrefix: "Error",
        exportCsv: "Export CSV",

        searchPlaceholder: "Search by course title, agency, or rationale...",
        filters: {
          statusLabel: "Status",
          all: "All",
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          withdrawn: "Withdrawn",
        },

        table: {
          courseTitle: "Course Title",
          agency: "Agency",
          level: "Level",
          submitted: "Submitted",
          status: "Status",
          actions: "Actions",
          empty: "—",
          view: "View",
          noData: "No course claim requests found.",
        },

        level: {
          na: "N/A",
        },

        modal: {
          title: "Course Claim Details",
          courseTitle: "Course Title",
          justification: "Justification / Rationale",
          agency: "Agency",
          status: "Status",
          submittedDate: "Submitted Date",
          reviewedDate: "Reviewed Date",
          tagsLabel: "Tags",
          tagCourseClaim: "Course Claim",
          attachments: "Attached Documents",
          noAttachments: "No attachments.",
          attachmentFallbackName: "Attachment",
          viewAttachment: "View",
          remarksLabel: "Remarks",
          remarksPlaceholder: "Add your review comments here...",
          approve: "Approve",
          reject: "Reject",
        },

        statusBadge: {
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          withdrawn: "Withdrawn",
        },

        pagination: {
          showing: "Showing {{from}}-{{to}} of {{total}}",
          pageOf: "Page {{page}} of {{totalPages}}",
        },

        alerts: {
          docIdMissing: "Document ID missing.",
          attachmentNotFound: "Attachment not found.",
          noFileData: "No file data available.",
          loadAttachmentFailed: "Failed to load attachment.",
          remarksRequired: "Please provide remarks before rejecting",
          approveFailed: "Failed to approve claim: {{message}}",
          rejectFailed: "Failed to reject claim: {{message}}",
        },
      },

      agencies: {
        title: "Assessment Agencies",
        loading: "Loading agencies…",
        errorPrefix: "Error",

        header: {
          export: "Export",
          addAgency: "Add Agency",
        },

        searchPlaceholder: "Search agencies by name, location, or email...",

        cards: {
          coursesOfferedLabel: "Courses Offered:",
          noCoursesLinked: "No courses linked",
          statusUnknown: "Unknown",
        },

        list: {
          empty: "No agencies found",
        },

        modal: {
          addTitle: "Add New Agency",
          editTitle: "Edit Agency",

          orgNameLabel: "Organization Name",
          adminEmailLabel: "Admin Email",
          locationLabel: "Location",
          phoneLabel: "Phone",
          websiteLabel: "Website",

          orgNamePlaceholder: "Excellence Assessment Center",
          adminEmailPlaceholder: "admin@agency.com",
          locationPlaceholder: "New York, NY",
          phonePlaceholder: "+1-555-0123",
          websitePlaceholder: "https://agency.com",

          linkCoursesLabel: "Link Courses to this Agency",
          noCoursesAvailable: "No courses available for this Awarding Body.",

          courseCodeLabel: "Code",
          nsqfLabel: "NSQF",

          cancel: "Cancel",
          submitAdd: "Add Agency",
          submitUpdate: "Update Agency",
        },

        alerts: {
          noAbContext: "No Awarding Body context (AB ID missing).",
          requiredFields: "Please fill in all required fields",
          noAbIdSave: "No Awarding Body id (AB ID). Cannot save agency.",
          noAbIdDelete: "No Awarding Body id (AB ID). Cannot delete agency.",
          saveFailed: "Failed to save agency",
          loadFailed: "Failed to load agencies",
          deleteFailed: "Failed to delete agency",
          confirmDelete: "Are you sure you want to delete this agency?",
        },

        tableExport: {
          filename: "agencies",
        },
      },

      courses: {
        title: "Course Management",
        loading: "Loading courses…",
        errorPrefix: "Error",

        header: {
          export: "Export",
          addCourse: "Add Course",
        },

        filters: {
          searchPlaceholder: "Search courses by title, description, or tags...",
          levelLabel: "Level",
          all: "All",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced",
        },

        cards: {
          noDescription: "No description",
          durationEmpty: "—",
          nsqfBadge: "NSQF {{level}}",
          noCourses: "No courses found",
          actions: {
            edit: "Edit",
            delete: "Delete",
          },
        },

        levelLabels: {
          Beginner: "Beginner",
          Intermediate: "Intermediate",
          Advanced: "Advanced",
          na: "N/A",
        },

        modal: {
          addTitle: "Add New Course",
          editTitle: "Edit Course",

          courseTitleLabel: "Course Title",
          courseTitlePlaceholder: "Advanced Data Analytics",

          descriptionLabel: "Description",
          descriptionPlaceholder:
            "Comprehensive program covering data mining, statistical analysis...",

          tagsLabel: "Tags (comma-separated)",
          tagsPlaceholder: "Cloud, Security, Networking",

          durationLabel: "Duration",
          durationPlaceholder: "12 weeks",

          levelLabel: "Level",

          nsqfLabel: "NSQF Level",
          nsqfPlaceholder: "4",

          cancel: "Cancel",
          submitAdd: "Add Course",
          submitUpdate: "Update Course",
        },

        alerts: {
          noAbContext: "No Awarding Body id (AB ID) in context.",
          requiredFields: "Please fill in all required fields",
          noAbIdSave: "No Awarding Body id (AB ID). Cannot save course.",
          noAbIdDelete: "No Awarding Body id (AB ID). Cannot delete course.",
          saveFailed: "Failed to save course",
          loadFailed: "Failed to load courses",
          deleteFailed: "Failed to delete course",
          confirmDelete: "Are you sure you want to delete this course?",
        },

        tableExport: {
          filename: "courses",
        },
      },

      profile: {
        title: "Profile Settings",

        buttons: {
          editProfile: "Edit Profile",
          cancel: "Cancel",
          saveChanges: "Save Changes",
          changePassword: "Change Password",
          updatePassword: "Update Password",
        },

        header: {
          roleFallback: "Awarding Body",
        },

        fields: {
          fullName: "Full Name",
          emailAddress: "Email Address",
          emailNote: "Email cannot be changed",
          phoneNumber: "Phone Number",
          department: "Department",
          role: "Role",
          roleNote: "Role cannot be changed",
          joinedDate: "Joined Date",
          joinedDateEmpty: "-",
        },

        security: {
          title: "Security Settings",
          subtitle: "Update your password to keep your account secure",
          currentPassword: "Current Password",
          currentPasswordPlaceholder: "Enter current password",
          newPassword: "New Password",
          newPasswordPlaceholder: "Enter new password (min {{min}} characters)",
          confirmNewPassword: "Confirm New Password",
          confirmNewPasswordPlaceholder: "Re-enter new password",
          cancel: "Cancel",
          updating: "Updating...",
        },

        messages: {
          profileUpdateSuccess: "Profile updated successfully!",
          profileUpdateFailure: "Failed to update profile. Please try again.",
          passwordMismatch: "New passwords do not match!",
          passwordMinLength:
            "Password must be at least {{min}} characters long!",
          passwordChangeSuccess: "Password changed successfully!",
          passwordChangeInvalid:
            "Current password is incorrect or new password is invalid!",
          passwordChangeFailure: "Failed to change password. Please try again.",
        },

        loadingStates: {
          saving: "Saving...",
        },
      },

      layout: {
        brand: {
          title: "Awarding Body Portal",
          subtitle: "Admin Dashboard",
        },
        nav: {
          dashboard: "Dashboard",
          certificates: "Certificate Requests",
          claims: "Course Claims",
          agencies: "Agencies",
          courses: "Courses",
          profile: "Profile",
        },
        language: {
          label: "Language",
          options: {
            en: "English",
            hi: "हिन्दी",
            ta: "தமிழ்",
            bn: "বাংলা",
          },
        },
        userBlock: {
          fallbackEmailName: "Awarding Admin",
          fallbackRole: "Awarding Body",
        },
        mobileMenu: {
          viewProfile: "View Profile",
          logout: "Logout",
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

      certificateRequests: {
        title: "प्रमाण पत्र अनुरोध",
        loading: "प्रमाण पत्र अनुरोध लोड हो रहे हैं…",
        errorPrefix: "त्रुटि",
        exportCsv: "CSV निर्यात करें",

        searchPlaceholder: "छात्र, कोर्स, एजेंसी या आईडी से खोजें...",
        filters: {
          statusLabel: "स्थिति",
          all: "सभी",
          pending: "लंबित",
          approved: "स्वीकृत",
          rejected: "अस्वीकृत",
          withdrawn: "वापस लिया गया",
        },

        table: {
          student: "विद्यार्थी",
          course: "पाठ्यक्रम",
          agency: "एजेंसी",
          submitted: "जमा करने की तिथि",
          status: "स्थिति",
          actions: "क्रियाएँ",
          unknownStudent: "अज्ञात विद्यार्थी",
          idLabel: "आईडी:",
          userIdLabel: "यूज़र आईडी:",
          empty: "—",
          view: "देखें",
        },

        modal: {
          titleFallback: "प्रमाण पत्र अनुरोध",
          requestId: "अनुरोध आईडी",
          status: "स्थिति",
          student: "विद्यार्थी",
          course: "पाठ्यक्रम",
          courseIdLabel: "आईडी:",
          agency: "एजेंसी",
          agencyUserIdLabel: "यूज़र आईडी:",
          submittedAt: "जमा करने की तिथि",
          justification: "औचित्य",
          attachments: "संलग्नक",
          noAttachments: "कोई संलग्नक नहीं",
          attachmentFallbackName: "संलग्नक",
          viewAttachment: "देखें",
          remarks: "टिप्पणियाँ",
          approve: "स्वीकृत करें",
          reject: "अस्वीकृत करें",
        },

        statusBadge: {
          pending: "लंबित",
          approved: "स्वीकृत",
          rejected: "अस्वीकृत",
          withdrawn: "वापस लिया गया",
        },

        pagination: {
          showing: "{{from}}-{{to}} में से {{total}} दिखाया जा रहा है",
          pageOf: "पृष्ठ {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "दस्तावेज़ आईडी गायब है।",
          attachmentNotFound: "संलग्नक नहीं मिला।",
          noFileData: "फ़ाइल डेटा उपलब्ध नहीं है।",
          loadAttachmentFailed: "संलग्नक लोड करने में विफल।",
          remarksRequired: "अस्वीकृत करने से पहले टिप्पणी दर्ज करें।",
          approveFailed: "स्वीकृति विफल: {{message}}",
          rejectFailed: "अस्वीकृति विफल: {{message}}",
        },
      },

      courseClaims: {
        title: "कोर्स क्लेम अनुरोध",
        loading: "कोर्स क्लेम अनुरोध लोड हो रहे हैं…",
        errorPrefix: "त्रुटि",
        exportCsv: "CSV निर्यात करें",

        searchPlaceholder: "कोर्स शीर्षक, एजेंसी या कारण से खोजें...",
        filters: {
          statusLabel: "स्थिति",
          all: "सभी",
          pending: "लंबित",
          approved: "स्वीकृत",
          rejected: "अस्वीकृत",
          withdrawn: "वापस लिया गया",
        },

        table: {
          courseTitle: "कोर्स शीर्षक",
          agency: "एजेंसी",
          level: "स्तर",
          submitted: "जमा करने की तिथि",
          status: "स्थिति",
          actions: "क्रियाएँ",
          empty: "—",
          view: "देखें",
          noData: "कोई कोर्स क्लेम अनुरोध नहीं मिला।",
        },

        level: {
          na: "उपलब्ध नहीं",
        },

        modal: {
          title: "कोर्स क्लेम विवरण",
          courseTitle: "कोर्स शीर्षक",
          justification: "औचित्य / कारण",
          agency: "एजेंसी",
          status: "स्थिति",
          submittedDate: "जमा करने की तिथि",
          reviewedDate: "समीक्षा तिथि",
          tagsLabel: "टैग",
          tagCourseClaim: "कोर्स क्लेम",
          attachments: "संलग्न दस्तावेज़",
          noAttachments: "कोई संलग्नक नहीं।",
          attachmentFallbackName: "संलग्नक",
          viewAttachment: "देखें",
          remarksLabel: "टिप्पणियाँ",
          remarksPlaceholder: "अपनी समीक्षा टिप्पणियाँ यहाँ लिखें...",
          approve: "स्वीकृत करें",
          reject: "अस्वीकृत करें",
        },

        statusBadge: {
          pending: "लंबित",
          approved: "स्वीकृत",
          rejected: "अस्वीकृत",
          withdrawn: "वापस लिया गया",
        },

        pagination: {
          showing: "{{total}} में से {{from}}-{{to}} दिखाए जा रहे हैं",
          pageOf: "पृष्ठ {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "दस्तावेज़ आईडी गायब है।",
          attachmentNotFound: "संलग्नक नहीं मिला।",
          noFileData: "फ़ाइल डेटा उपलब्ध नहीं है।",
          loadAttachmentFailed: "संलग्नक लोड करने में विफल।",
          remarksRequired: "अस्वीकृत करने से पहले टिप्पणी दर्ज करें।",
          approveFailed: "क्लेम स्वीकृत करने में विफल: {{message}}",
          rejectFailed: "क्लेम अस्वीकृत करने में विफल: {{message}}",
        },
      },

      agencies: {
        title: "मूल्यांकन एजेंसियाँ",
        loading: "एजेंसियाँ लोड हो रही हैं…",
        errorPrefix: "त्रुटि",

        header: {
          export: "निर्यात करें",
          addAgency: "नई एजेंसी जोड़ें",
        },

        searchPlaceholder: "एजेंसी का नाम, स्थान या ईमेल से खोजें...",

        cards: {
          coursesOfferedLabel: "प्रस्तावित पाठ्यक्रम:",
          noCoursesLinked: "कोई पाठ्यक्रम लिंक नहीं है",
          statusUnknown: "अज्ञात",
        },

        list: {
          empty: "कोई एजेंसी नहीं मिली",
        },

        modal: {
          addTitle: "नई एजेंसी जोड़ें",
          editTitle: "एजेंसी संपादित करें",

          orgNameLabel: "संस्था का नाम",
          adminEmailLabel: "ऐडमिन ईमेल",
          locationLabel: "स्थान",
          phoneLabel: "फ़ोन",
          websiteLabel: "वेबसाइट",

          orgNamePlaceholder: "Excellence Assessment Center",
          adminEmailPlaceholder: "admin@agency.com",
          locationPlaceholder: "New Delhi, India",
          phonePlaceholder: "+91-98765-43210",
          websitePlaceholder: "https://agency.com",

          linkCoursesLabel: "इस एजेंसी से पाठ्यक्रम लिंक करें",
          noCoursesAvailable:
            "इस प्राधिकरण के लिए कोई पाठ्यक्रम उपलब्ध नहीं है।",

          courseCodeLabel: "कोड",
          nsqfLabel: "NSQF",

          cancel: "रद्द करें",
          submitAdd: "एजेंसी जोड़ें",
          submitUpdate: "एजेंसी अपडेट करें",
        },

        alerts: {
          noAbContext: "प्राधिकरण बॉडी (AB ID) उपलब्ध नहीं है।",
          requiredFields: "कृपया सभी आवश्यक फ़ील्ड भरें।",
          noAbIdSave:
            "प्राधिकरण बॉडी आईडी (AB ID) नहीं है, एजेंसी सहेजी नहीं जा सकती।",
          noAbIdDelete:
            "प्राधिकरण बॉडी आईडी (AB ID) नहीं है, एजेंसी हटाई नहीं जा सकती।",
          saveFailed: "एजेंसी सहेजने में विफल।",
          loadFailed: "एजेंसियों को लोड करने में विफल।",
          deleteFailed: "एजेंसी हटाने में विफल।",
          confirmDelete: "क्या आप वाकई इस एजेंसी को हटाना चाहते हैं?",
        },

        tableExport: {
          filename: "agencies",
        },
      },

      courses: {
        title: "पाठ्यक्रम प्रबंधन",
        loading: "पाठ्यक्रम लोड हो रहे हैं…",
        errorPrefix: "त्रुटि",

        header: {
          export: "निर्यात करें",
          addCourse: "नया पाठ्यक्रम जोड़ें",
        },

        filters: {
          searchPlaceholder:
            "शीर्षक, विवरण या टैग के आधार पर पाठ्यक्रम खोजें...",
          levelLabel: "स्तर",
          all: "सभी",
          beginner: "प्रारंभिक",
          intermediate: "मध्यम",
          advanced: "उन्नत",
        },

        cards: {
          noDescription: "कोई विवरण उपलब्ध नहीं",
          durationEmpty: "—",
          nsqfBadge: "NSQF {{level}}",
          noCourses: "कोई पाठ्यक्रम नहीं मिला",
          actions: {
            edit: "संपादित करें",
            delete: "हटाएँ",
          },
        },

        levelLabels: {
          Beginner: "प्रारंभिक",
          Intermediate: "मध्यम",
          Advanced: "उन्नत",
          na: "N/A",
        },

        modal: {
          addTitle: "नया पाठ्यक्रम जोड़ें",
          editTitle: "पाठ्यक्रम संपादित करें",

          courseTitleLabel: "पाठ्यक्रम शीर्षक",
          courseTitlePlaceholder: "Advanced Data Analytics",

          descriptionLabel: "विवरण",
          descriptionPlaceholder:
            "डेटा माइनिंग, सांख्यिकीय विश्लेषण आदि को कवर करने वाला विस्तृत कार्यक्रम...",

          tagsLabel: "टैग (कॉमा द्वारा अलग करें)",
          tagsPlaceholder: "क्लाउड, सुरक्षा, नेटवर्किंग",

          durationLabel: "अवधि",
          durationPlaceholder: "12 सप्ताह",

          levelLabel: "स्तर",

          nsqfLabel: "NSQF स्तर",
          nsqfPlaceholder: "4",

          cancel: "रद्द करें",
          submitAdd: "पाठ्यक्रम जोड़ें",
          submitUpdate: "पाठ्यक्रम अपडेट करें",
        },

        alerts: {
          noAbContext: "कॉन्टेक्स्ट में प्राधिकरण बॉडी आईडी (AB ID) नहीं है।",
          requiredFields: "कृपया सभी आवश्यक फ़ील्ड भरें।",
          noAbIdSave:
            "प्राधिकरण बॉडी आईडी (AB ID) नहीं है, पाठ्यक्रम सहेजा नहीं जा सकता।",
          noAbIdDelete:
            "प्राधिकरण बॉडी आईडी (AB ID) नहीं है, पाठ्यक्रम हटाया नहीं जा सकता।",
          saveFailed: "पाठ्यक्रम सहेजने में विफल।",
          loadFailed: "पाठ्यक्रम लोड करने में विफल।",
          deleteFailed: "पाठ्यक्रम हटाने में विफल।",
          confirmDelete: "क्या आप वाकई इस पाठ्यक्रम को हटाना चाहते हैं?",
        },

        tableExport: {
          filename: "courses",
        },
      },

      profile: {
        title: "प्रोफ़ाइल सेटिंग्स",

        buttons: {
          editProfile: "प्रोफ़ाइल संपादित करें",
          cancel: "रद्द करें",
          saveChanges: "परिवर्तन सहेजें",
          changePassword: "पासवर्ड बदलें",
          updatePassword: "पासवर्ड अपडेट करें",
        },

        header: {
          roleFallback: "प्राधिकरण निकाय",
        },

        fields: {
          fullName: "पूरा नाम",
          emailAddress: "ईमेल पता",
          emailNote: "ईमेल बदला नहीं जा सकता",
          phoneNumber: "फ़ोन नंबर",
          department: "विभाग",
          role: "भूमिका",
          roleNote: "भूमिका बदली नहीं जा सकती",
          joinedDate: "जुड़ने की तिथि",
          joinedDateEmpty: "-",
        },

        security: {
          title: "सुरक्षा सेटिंग्स",
          subtitle: "अपने खाते को सुरक्षित रखने के लिए पासवर्ड अपडेट करें",
          currentPassword: "वर्तमान पासवर्ड",
          currentPasswordPlaceholder: "वर्तमान पासवर्ड दर्ज करें",
          newPassword: "नया पासवर्ड",
          newPasswordPlaceholder:
            "नया पासवर्ड दर्ज करें (कम से कम {{min}} अक्षर)",
          confirmNewPassword: "नया पासवर्ड पुष्टि करें",
          confirmNewPasswordPlaceholder: "नया पासवर्ड दोबारा दर्ज करें",
          cancel: "रद्द करें",
          updating: "अपडेट हो रहा है...",
        },

        messages: {
          profileUpdateSuccess: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!",
          profileUpdateFailure:
            "प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
          passwordMismatch: "नए पासवर्ड मेल नहीं खा रहे हैं!",
          passwordMinLength: "पासवर्ड कम से कम {{min}} अक्षरों का होना चाहिए!",
          passwordChangeSuccess: "पासवर्ड सफलतापूर्वक बदल दिया गया!",
          passwordChangeInvalid:
            "वर्तमान पासवर्ड गलत है या नया पासवर्ड अमान्य है!",
          passwordChangeFailure:
            "पासवर्ड बदलने में विफल। कृपया पुनः प्रयास करें।",
        },

        loadingStates: {
          saving: "सहेजा जा रहा है...",
        },
      },

      layout: {
        brand: {
          title: "प्राधिकरण पोर्टल",
          subtitle: "एडमिन डैशबोर्ड",
        },
        nav: {
          dashboard: "डैशबोर्ड",
          certificates: "प्रमाण पत्र अनुरोध",
          claims: "पाठ्यक्रम दावे",
          agencies: "एजेंसियाँ",
          courses: "पाठ्यक्रम",
          profile: "प्रोफ़ाइल",
        },
        language: {
          label: "भाषा",
          options: {
            en: "English",
            hi: "हिन्दी",
            ta: "தமிழ்",
            bn: "বাংলা",
          },
        },
        userBlock: {
          fallbackEmailName: "प्राधिकरण एडमिन",
          fallbackRole: "प्राधिकरण निकाय",
        },
        mobileMenu: {
          viewProfile: "प्रोफ़ाइल देखें",
          logout: "लॉगआउट",
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

      certificateRequests: {
        title: "சான்றிதழ் கோரிக்கைகள்",
        loading: "சான்றிதழ் கோரிக்கைகளை ஏற்றுகிறது…",
        errorPrefix: "பிழை",
        exportCsv: "CSV ஏற்றுமதி",

        searchPlaceholder:
          "மாணவர், பாடநெறி, நிறுவனம் அல்லது ஐடி மூலம் தேடுங்கள்...",
        filters: {
          statusLabel: "நிலை",
          all: "அனைத்தும்",
          pending: "நிலுவையில்",
          approved: "அங்கீகரிக்கப்பட்டது",
          rejected: "நிராகரிக்கப்பட்டது",
          withdrawn: "திரும்பப் பெறப்பட்டது",
        },

        table: {
          student: "மாணவர்",
          course: "பாடநெறி",
          agency: "நிறுவனம்",
          submitted: "சமர்ப்பித்த தேதி",
          status: "நிலை",
          actions: "செயல்கள்",
          unknownStudent: "அறியப்படாத மாணவர்",
          idLabel: "ஐடி:",
          userIdLabel: "பயனர் ஐடி:",
          empty: "—",
          view: "காண்க",
        },

        modal: {
          titleFallback: "சான்றிதழ் கோரிக்கை",
          requestId: "கோரிக்கை ஐடி",
          status: "நிலை",
          student: "மாணவர்",
          course: "பாடநெறி",
          courseIdLabel: "ஐடி:",
          agency: "நிறுவனம்",
          agencyUserIdLabel: "பயனர் ஐடி:",
          submittedAt: "சமர்ப்பித்த தேதி",
          justification: "நியாயம் / காரணம்",
          attachments: "இணைப்புகள்",
          noAttachments: "இணைப்புகள் எதுவும் இல்லை",
          attachmentFallbackName: "இணைப்பு",
          viewAttachment: "காண்க",
          remarks: "குறிப்புகள்",
          approve: "அங்கீகரிக்க",
          reject: "நிராகரிக்க",
        },

        statusBadge: {
          pending: "நிலுவையில்",
          approved: "அங்கீகரிக்கப்பட்டது",
          rejected: "நிராகரிக்கப்பட்டது",
          withdrawn: "திரும்பப் பெறப்பட்டது",
        },

        pagination: {
          showing: "{{total}} இல் {{from}}-{{to}} வரை காட்டப்படுகிறது",
          pageOf: "பக்கம் {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "ஆவண ஐடி இல்லை.",
          attachmentNotFound: "இணைப்பு கிடைக்கவில்லை.",
          noFileData: "கோப்பு தரவு இல்லை.",
          loadAttachmentFailed: "இணைப்பை ஏற்ற முடியவில்லை.",
          remarksRequired: "நிராகரிக்கும் முன் குறிப்புகளை உள்ளிடவும்.",
          approveFailed: "அங்கீகாரம் தோல்வியடைந்தது: {{message}}",
          rejectFailed: "நிராகரிப்பு தோல்வியடைந்தது: {{message}}",
        },
      },

      courseClaims: {
        title: "பாடநெறி கோரிக்கை (Course Claim) விண்ணப்பங்கள்",
        loading: "பாடநெறி கோரிக்கை விண்ணப்பங்களை ஏற்றுகிறது…",
        errorPrefix: "பிழை",
        exportCsv: "CSV ஏற்றுமதி",

        searchPlaceholder:
          "பாடநெறி தலைப்பு, நிறுவனம் அல்லது காரணம் மூலம் தேடுங்கள்...",
        filters: {
          statusLabel: "நிலை",
          all: "அனைத்தும்",
          pending: "நிலுவையில்",
          approved: "அங்கீகரிக்கப்பட்டது",
          rejected: "நிராகரிக்கப்பட்டது",
          withdrawn: "திரும்பப் பெறப்பட்டது",
        },

        table: {
          courseTitle: "பாடநெறி தலைப்பு",
          agency: "நிறுவனம்",
          level: "மட்டம்",
          submitted: "சமர்ப்பித்த தேதி",
          status: "நிலை",
          actions: "செயல்கள்",
          empty: "—",
          view: "காண்க",
          noData: "பாடநெறி கோரிக்கை விண்ணப்பங்கள் எதுவும் இல்லை.",
        },

        level: {
          na: "தகவல் இல்லை",
        },

        modal: {
          title: "பாடநெறி கோரிக்கை விவரங்கள்",
          courseTitle: "பாடநெறி தலைப்பு",
          justification: "நியாயம் / காரணம்",
          agency: "நிறுவனம்",
          status: "நிலை",
          submittedDate: "சமர்ப்பித்த தேதி",
          reviewedDate: "பரிசீலித்த தேதி",
          tagsLabel: "டேக்(கள்)",
          tagCourseClaim: "பாடநெறி கோரிக்கை",
          attachments: "இணைக்கப்பட்ட ஆவணங்கள்",
          noAttachments: "இணைப்புகள் எதுவும் இல்லை.",
          attachmentFallbackName: "இணைப்பு",
          viewAttachment: "காண்க",
          remarksLabel: "குறிப்புகள்",
          remarksPlaceholder:
            "உங்கள் மதிப்பாய்வு குறிப்புகளை இங்கு எழுதவும்...",
          approve: "அங்கீகரிக்க",
          reject: "நிராகரிக்க",
        },

        statusBadge: {
          pending: "நிலுவையில்",
          approved: "அங்கீகரிக்கப்பட்டது",
          rejected: "நிராகரிக்கப்பட்டது",
          withdrawn: "திரும்பப் பெறப்பட்டது",
        },

        pagination: {
          showing: "{{total}} இல் {{from}}-{{to}} வரை காட்டப்படுகிறது",
          pageOf: "பக்கம் {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "ஆவண ஐடி இல்லை.",
          attachmentNotFound: "இணைப்பு கிடைக்கவில்லை.",
          noFileData: "கோப்பு தரவு இல்லை.",
          loadAttachmentFailed: "இணைப்பை ஏற்ற முடியவில்லை.",
          remarksRequired: "நிராகரிக்கும் முன் குறிப்புகளை உள்ளிடவும்.",
          approveFailed: "கோரிக்கையை அங்கீகரிப்பதில் தோல்வி: {{message}}",
          rejectFailed: "கோரிக்கையை நிராகரிப்பதில் தோல்வி: {{message}}",
        },
      },

      agencies: {
        title: "மதிப்பீட்டு நிறுவனங்கள்",
        loading: "நிறுவனங்களை ஏற்றுகிறது…",
        errorPrefix: "பிழை",

        header: {
          export: "ஏற்றுமதி",
          addAgency: "புதிய நிறுவனம் சேர்க்க",
        },

        searchPlaceholder:
          "நிறுவனம் பெயர், இடம் அல்லது மின்னஞ்சல் மூலம் தேடுங்கள்...",

        cards: {
          coursesOfferedLabel: "வழங்கப்படும் பாடநெறிகள்:",
          noCoursesLinked: "எந்தப் பாடநெறியும் இணைக்கப்படவில்லை",
          statusUnknown: "தெரியவில்லை",
        },

        list: {
          empty: "எந்த நிறுவனமும் காணப்படவில்லை",
        },

        modal: {
          addTitle: "புதிய நிறுவனம் சேர்க்க",
          editTitle: "நிறுவனத்தை திருத்துக",

          orgNameLabel: "நிறுவனத்தின் பெயர்",
          adminEmailLabel: "அட்மின் மின்னஞ்சல்",
          locationLabel: "இடம்",
          phoneLabel: "தொலைபேசி",
          websiteLabel: "இணையதளம்",

          orgNamePlaceholder: "Excellence Assessment Center",
          adminEmailPlaceholder: "admin@agency.com",
          locationPlaceholder: "Chennai, Tamil Nadu",
          phonePlaceholder: "+91-98765-43210",
          websitePlaceholder: "https://agency.com",

          linkCoursesLabel: "இந்த நிறுவனத்துடன் பாடநெறிகளை இணைக்கவும்",
          noCoursesAvailable:
            "இந்த அதிகாரத்தில் (Awarding Body) எந்தப் பாடநெறியும் இல்லை.",

          courseCodeLabel: "குறியீடு",
          nsqfLabel: "NSQF",

          cancel: "ரத்து செய்",
          submitAdd: "நிறுவனம் சேர்க்க",
          submitUpdate: "நிறுவனம் புதுப்பிக்க",
        },

        alerts: {
          noAbContext: "Awarding Body (AB ID) கிடைக்கவில்லை.",
          requiredFields: "அனைத்து தேவையான புலங்களையும் நிரப்பவும்.",
          noAbIdSave:
            "Awarding Body ID (AB ID) இல்லாமல் நிறுவனம் சேமிக்க முடியாது.",
          noAbIdDelete:
            "Awarding Body ID (AB ID) இல்லாமல் நிறுவனம் நீக்க முடியாது.",
          saveFailed: "நிறுவனத்தை சேமிக்க முடியவில்லை.",
          loadFailed: "நிறுவனங்களை ஏற்ற முடியவில்லை.",
          deleteFailed: "நிறுவனத்தை நீக்க முடியவில்லை.",
          confirmDelete: "இந்த நிறுவனத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        },

        tableExport: {
          filename: "agencies",
        },
      },

      courses: {
        title: "பாடநெறி மேலாண்மை",
        loading: "பாடநெறிகளை ஏற்றுகிறது…",
        errorPrefix: "பிழை",

        header: {
          export: "ஏற்றுமதி",
          addCourse: "புதிய பாடநெறி சேர்க்க",
        },

        filters: {
          searchPlaceholder:
            "தலைப்பு, விளக்கம் அல்லது குறிச்சொற்கள் மூலம் பாடநெறிகளைத் தேடுங்கள்...",
          levelLabel: "நிலை",
          all: "அனைத்தும்",
          beginner: "அடிப்படை",
          intermediate: "இடைநிலை",
          advanced: "மேம்பட்ட",
        },

        cards: {
          noDescription: "விளக்கம் இல்லை",
          durationEmpty: "—",
          nsqfBadge: "NSQF {{level}}",
          noCourses: "எந்த பாடநெறியும் கிடைக்கவில்லை",
          actions: {
            edit: "திருத்து",
            delete: "அழி",
          },
        },

        levelLabels: {
          Beginner: "அடிப்படை",
          Intermediate: "இடைநிலை",
          Advanced: "மேம்பட்ட",
          na: "N/A",
        },

        modal: {
          addTitle: "புதிய பாடநெறி சேர்க்க",
          editTitle: "பாடநெறியை திருத்துக",

          courseTitleLabel: "பாடநெறி தலைப்பு",
          courseTitlePlaceholder: "Advanced Data Analytics",

          descriptionLabel: "விளக்கம்",
          descriptionPlaceholder:
            "தரவு சுரங்கம், புள்ளியியல் பகுப்பாய்வு உள்ளிட்ட முழுமையான திட்டம்...",

          tagsLabel: "குறிச்சொற்கள் (கமா கொண்டு பிரிக்கவும்)",
          tagsPlaceholder: "Cloud, Security, Networking",

          durationLabel: "காலம்",
          durationPlaceholder: "12 வாரங்கள்",

          levelLabel: "நிலை",

          nsqfLabel: "NSQF நிலை",
          nsqfPlaceholder: "4",

          cancel: "ரத்து செய்",
          submitAdd: "பாடநெறி சேர்க்க",
          submitUpdate: "பாடநெறி புதுப்பிக்க",
        },

        alerts: {
          noAbContext: "கட்டத்தில் Awarding Body ID (AB ID) இல்லை.",
          requiredFields: "அனைத்து தேவையான புலங்களையும் நிரப்பவும்.",
          noAbIdSave:
            "Awarding Body ID (AB ID) இல்லாமல் பாடநெறியை சேமிக்க முடியாது.",
          noAbIdDelete:
            "Awarding Body ID (AB ID) இல்லாமல் பாடநெறியை நீக்க முடியாது.",
          saveFailed: "பாடநெறியை சேமிக்க முடியவில்லை.",
          loadFailed: "பாடநெறிகளை ஏற்ற முடியவில்லை.",
          deleteFailed: "பாடநெறியை நீக்க முடியவில்லை.",
          confirmDelete: "இந்த பாடநெறியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        },

        tableExport: {
          filename: "courses",
        },
      },

      profile: {
        title: "சுயவிவர அமைப்புகள்",

        buttons: {
          editProfile: "சுயவிவரத்தை திருத்து",
          cancel: "ரத்து செய்",
          saveChanges: "மாற்றங்களை சேமிக்க",
          changePassword: "கடவுச்சொல்லை மாற்று",
          updatePassword: "கடவுச்சொல்லை புதுப்பிக்க",
        },

        header: {
          roleFallback: "அதிகார நிறுவனம்",
        },

        fields: {
          fullName: "முழு பெயர்",
          emailAddress: "மின்னஞ்சல் முகவரி",
          emailNote: "மின்னஞ்சலை மாற்ற முடியாது",
          phoneNumber: "தொலைபேசி எண்",
          department: "துறை",
          role: "பங்கு",
          roleNote: "பங்கையை மாற்ற முடியாது",
          joinedDate: "சேர்ந்த தேதி",
          joinedDateEmpty: "-",
        },

        security: {
          title: "பாதுகாப்பு அமைப்புகள்",
          subtitle:
            "உங்கள் கணக்கை பாதுகாப்பாக வைத்திருக்க கடவுச்சொல்லை புதுப்பிக்கவும்",
          currentPassword: "தற்போதைய கடவுச்சொல்",
          currentPasswordPlaceholder: "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்",
          newPassword: "புதிய கடவுச்சொல்",
          newPasswordPlaceholder:
            "புதிய கடவுச்சொல்லை உள்ளிடவும் (குறைந்தது {{min}} எழுத்துகள்)",
          confirmNewPassword: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
          confirmNewPasswordPlaceholder:
            "புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
          cancel: "ரத்து செய்",
          updating: "புதுப்பித்து வருகிறது...",
        },

        messages: {
          profileUpdateSuccess: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
          profileUpdateFailure:
            "சுயவிவரத்தை புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
          passwordMismatch: "புதிய கடவுச்சொற்கள் பொருந்தவில்லை!",
          passwordMinLength:
            "கடவுச்சொல் குறைந்தது {{min}} எழுத்துகள் இருக்க வேண்டும்!",
          passwordChangeSuccess: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!",
          passwordChangeInvalid:
            "தற்போதைய கடவுச்சொல் தவறானது அல்லது புதிய கடவுச்சொல் தவறானது!",
          passwordChangeFailure:
            "கடவுச்சொல்லை மாற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        },

        loadingStates: {
          saving: "சேமித்து வருகிறது...",
        },
      },

      // inside resources.ta.translation
      layout: {
        brand: {
          title: "அதிகார போர்டல்",
          subtitle: "நிர்வாக டாஷ்போர்ட்",
        },
        nav: {
          dashboard: "டாஷ்போர்ட்",
          certificates: "சான்றிதழ் கோரிக்கைகள்",
          claims: "பாடநெறி கோரிக்கைகள்",
          agencies: "நிறுவனங்கள்",
          courses: "பாடநெறிகள்",
          profile: "சுயவிவரம்",
        },
        language: {
          label: "மொழி",
          options: {
            en: "English",
            hi: "हिन्दी",
            ta: "தமிழ்",
            bn: "বাংলা",
          },
        },
        userBlock: {
          fallbackEmailName: "அதிகார நிர்வாகி",
          fallbackRole: "அதிகார நிறுவனம்",
        },
        mobileMenu: {
          viewProfile: "சுயவிவரத்தை காண்க",
          logout: "வெளியேறு",
        },
      },
    },
  },

  bn: {
    translation: {
      dashboard: {
        hero: {
          slide1: {
            title: "শিক্ষা মূল্যায়নে উৎকর্ষ",
            subtitle: "সারা দেশে মান নিশ্চিত করা",
          },
          slide2: {
            title: "মূল্যায়ন সংস্থাকে ক্ষমতায়ন",
            subtitle: "একসঙ্গে একটি উন্নত ভবিষ্যৎ গড়ে তুলি",
          },
          slide3: {
            title: "বিশ্বাসযোগ্য সনদ",
            subtitle: "জাতীয় কর্তৃপক্ষ দ্বারা যাচাই করা",
          },
        },
        overviewTitle: "ওভারভিউ",
        stats: {
          totalAgencies: "মোট সংস্থা",
          activeCourses: "সক্রিয় কোর্স",
          pendingCertificates: "বিচারাধীন সনদ অনুরোধ",
          pendingClaims: "বিচারাধীন কোর্স দাবি",
        },
        activity: {
          title: "সাম্প্রতিক কার্যকলাপ",
          none: "কোনো সাম্প্রতিক কার্যকলাপ নেই",
          types: {
            certificateRequest: "সনদ অনুরোধ",
            courseClaim: "কোর্স দাবি",
          },
          status: {
            pendingReview: "পর্যালোচনাধীন",
          },
        },
      },

      certificateRequests: {
        title: "সনদ অনুরোধসমূহ",
        loading: "সনদ অনুরোধগুলো লোড করা হচ্ছে…",
        errorPrefix: "ত্রুটি",
        exportCsv: "CSV রপ্তানি",

        searchPlaceholder: "শিক্ষার্থী, কোর্স, সংস্থা বা আইডি দিয়ে খুঁজুন...",
        filters: {
          statusLabel: "অবস্থা",
          all: "সব",
          pending: "বিচারাধীন",
          approved: "অনুমোদিত",
          rejected: "প্রত্যাখ্যাত",
          withdrawn: "প্রত্যাহার করা হয়েছে",
        },

        table: {
          student: "শিক্ষার্থী",
          course: "কোর্স",
          agency: "সংস্থা",
          submitted: "জমাদানের তারিখ",
          status: "অবস্থা",
          actions: "অ্যাকশন",
          unknownStudent: "অজানা শিক্ষার্থী",
          idLabel: "আইডি:",
          userIdLabel: "ইউজার আইডি:",
          empty: "—",
          view: "দেখুন",
        },

        modal: {
          titleFallback: "সনদ অনুরোধ",
          requestId: "অনুরোধ আইডি",
          status: "অবস্থা",
          student: "শিক্ষার্থী",
          course: "কোর্স",
          courseIdLabel: "আইডি:",
          agency: "সংস্থা",
          agencyUserIdLabel: "ইউজার আইডি:",
          submittedAt: "জমাদানের তারিখ",
          justification: "যুক্তি / কারণ",
          attachments: "সংযুক্তি",
          noAttachments: "কোনো সংযুক্তি নেই",
          attachmentFallbackName: "সংযুক্তি",
          viewAttachment: "দেখুন",
          remarks: "মন্তব্য",
          approve: "অনুমোদন",
          reject: "প্রত্যাখ্যান",
        },

        statusBadge: {
          pending: "বিচারাধীন",
          approved: "অনুমোদিত",
          rejected: "প্রত্যাখ্যাত",
          withdrawn: "প্রত্যাহার করা হয়েছে",
        },

        pagination: {
          showing: "{{total}}টির মধ্যে {{from}}-{{to}}টি দেখানো হচ্ছে",
          pageOf: "পৃষ্ঠা {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "ডকুমেন্ট আইডি অনুপস্থিত।",
          attachmentNotFound: "সংযুক্তি পাওয়া যায়নি।",
          noFileData: "ফাইল ডেটা পাওয়া যায়নি।",
          loadAttachmentFailed: "সংযুক্তি লোড করতে ব্যর্থ হয়েছে।",
          remarksRequired: "প্রত্যাখ্যানের আগে অনুগ্রহ করে মন্তব্য লিখুন।",
          approveFailed: "অনুমোদন ব্যর্থ: {{message}}",
          rejectFailed: "প্রত্যাখ্যান ব্যর্থ: {{message}}",
        },
      },

      courseClaims: {
        title: "কোর্স ক্লেইম অনুরোধসমূহ",
        loading: "কোর্স ক্লেইম অনুরোধগুলো লোড করা হচ্ছে…",
        errorPrefix: "ত্রুটি",
        exportCsv: "CSV রপ্তানি",

        searchPlaceholder: "কোর্স শিরোনাম, সংস্থা বা কারণ দিয়ে খুঁজুন...",
        filters: {
          statusLabel: "অবস্থা",
          all: "সব",
          pending: "বিচারাধীন",
          approved: "অনুমোদিত",
          rejected: "প্রত্যাখ্যাত",
          withdrawn: "প্রত্যাহার করা হয়েছে",
        },

        table: {
          courseTitle: "কোর্স শিরোনাম",
          agency: "সংস্থা",
          level: "লেভেল",
          submitted: "জমাদানের তারিখ",
          status: "অবস্থা",
          actions: "অ্যাকশন",
          empty: "—",
          view: "দেখুন",
          noData: "কোনো কোর্স ক্লেইম অনুরোধ পাওয়া যায়নি।",
        },

        level: {
          na: "প্রযোজ্য নয়",
        },

        modal: {
          title: "কোর্স ক্লেইমের বিস্তারিত",
          courseTitle: "কোর্স শিরোনাম",
          justification: "যুক্তি / কারণ",
          agency: "সংস্থা",
          status: "অবস্থা",
          submittedDate: "জমাদানের তারিখ",
          reviewedDate: "পর্যালোচনার তারিখ",
          tagsLabel: "ট্যাগ",
          tagCourseClaim: "কোর্স ক্লেইম",
          attachments: "সংযুক্ত ডকুমেন্ট",
          noAttachments: "কোনো সংযুক্তি নেই।",
          attachmentFallbackName: "সংযুক্তি",
          viewAttachment: "দেখুন",
          remarksLabel: "মন্তব্য",
          remarksPlaceholder: "এখানে আপনার রিভিউ মন্তব্য লিখুন...",
          approve: "অনুমোদন",
          reject: "প্রত্যাখ্যান",
        },

        statusBadge: {
          pending: "বিচারাধীন",
          approved: "অনুমোদিত",
          rejected: "প্রত্যাখ্যাত",
          withdrawn: "প্রত্যাহার করা হয়েছে",
        },

        pagination: {
          showing: "{{total}}টির মধ্যে {{from}}-{{to}}টি দেখানো হচ্ছে",
          pageOf: "পৃষ্ঠা {{page}} / {{totalPages}}",
        },

        alerts: {
          docIdMissing: "ডকুমেন্ট আইডি অনুপস্থিত।",
          attachmentNotFound: "সংযুক্তি পাওয়া যায়নি।",
          noFileData: "ফাইল ডেটা পাওয়া যায়নি।",
          loadAttachmentFailed: "সংযুক্তি লোড করতে ব্যর্থ হয়েছে।",
          remarksRequired: "প্রত্যাখ্যানের আগে অনুগ্রহ করে মন্তব্য লিখুন।",
          approveFailed: "ক্লেইম অনুমোদন ব্যর্থ: {{message}}",
          rejectFailed: "ক্লেইম প্রত্যাখ্যান ব্যর্থ: {{message}}",
        },
      },

      agencies: {
        title: "মূল্যায়ন সংস্থাগুলো",
        loading: "সংস্থাগুলো লোড করা হচ্ছে…",
        errorPrefix: "ত্রুটি",

        header: {
          export: "রপ্তানি",
          addAgency: "নতুন সংস্থা যোগ করুন",
        },

        searchPlaceholder: "নাম, অবস্থান বা ইমেল দিয়ে সংস্থা খুঁজুন...",

        cards: {
          coursesOfferedLabel: "প্রদত্ত কোর্সসমূহ:",
          noCoursesLinked: "কোনো কোর্স যুক্ত নেই",
          statusUnknown: "অজানা",
        },

        list: {
          empty: "কোনো সংস্থা পাওয়া যায়নি",
        },

        modal: {
          addTitle: "নতুন সংস্থা যোগ করুন",
          editTitle: "সংস্থা সম্পাদনা করুন",

          orgNameLabel: "প্রতিষ্ঠানের নাম",
          adminEmailLabel: "অ্যাডমিন ইমেল",
          locationLabel: "অবস্থান",
          phoneLabel: "ফোন",
          websiteLabel: "ওয়েবসাইট",

          orgNamePlaceholder: "Excellence Assessment Center",
          adminEmailPlaceholder: "admin@agency.com",
          locationPlaceholder: "Kolkata, West Bengal",
          phonePlaceholder: "+91-98765-43210",
          websitePlaceholder: "https://agency.com",

          linkCoursesLabel: "এই সংস্থার সাথে কোর্স যুক্ত করুন",
          noCoursesAvailable: "এই অথরিটি বডির জন্য কোনো কোর্স উপলভ্য নেই।",

          courseCodeLabel: "কোড",
          nsqfLabel: "NSQF",

          cancel: "বাতিল",
          submitAdd: "সংস্থা যোগ করুন",
          submitUpdate: "সংস্থা আপডেট করুন",
        },

        alerts: {
          noAbContext: "অথরিটি বডি কনটেক্সট (AB ID) পাওয়া যায়নি।",
          requiredFields: "দয়া করে সব প্রয়োজনীয় ঘরগুলো পূরণ করুন।",
          noAbIdSave:
            "অথরিটি বডি আইডি (AB ID) ছাড়া সংস্থা সংরক্ষণ করা যাবে না।",
          noAbIdDelete:
            "অথরিটি বডি আইডি (AB ID) ছাড়া সংস্থা মুছে ফেলা যাবে না।",
          saveFailed: "সংস্থা সংরক্ষণ করতে ব্যর্থ।",
          loadFailed: "সংস্থাগুলো লোড করতে ব্যর্থ।",
          deleteFailed: "সংস্থা মুছে ফেলতে ব্যর্থ।",
          confirmDelete: "আপনি কি নিশ্চিত যে আপনি এই সংস্থাটি মুছে ফেলতে চান?",
        },

        tableExport: {
          filename: "agencies",
        },
      },

      courses: {
        title: "কোর্স ব্যবস্থাপনা",
        loading: "কোর্সগুলো লোড করা হচ্ছে…",
        errorPrefix: "ত্রুটি",

        header: {
          export: "রপ্তানি",
          addCourse: "নতুন কোর্স যোগ করুন",
        },

        filters: {
          searchPlaceholder: "শিরোনাম, বিবরণ অথবা ট্যাগ দিয়ে কোর্স খুঁজুন...",
          levelLabel: "স্তর",
          all: "সব",
          beginner: "বিগিনার",
          intermediate: "ইন্টারমিডিয়েট",
          advanced: "অ্যাডভান্সড",
        },

        cards: {
          noDescription: "কোনো বিবরণ নেই",
          durationEmpty: "—",
          nsqfBadge: "NSQF {{level}}",
          noCourses: "কোনো কোর্স পাওয়া যায়নি",
          actions: {
            edit: "সম্পাদনা",
            delete: "মুছে ফেলুন",
          },
        },

        levelLabels: {
          Beginner: "বিগিনার",
          Intermediate: "ইন্টারমিডিয়েট",
          Advanced: "অ্যাডভান্সড",
          na: "N/A",
        },

        modal: {
          addTitle: "নতুন কোর্স যোগ করুন",
          editTitle: "কোর্স সম্পাদনা করুন",

          courseTitleLabel: "কোর্স শিরোনাম",
          courseTitlePlaceholder: "Advanced Data Analytics",

          descriptionLabel: "বিবরণ",
          descriptionPlaceholder:
            "ডেটা মাইনিং, স্ট্যাটিস্টিক্যাল অ্যানালাইসিস ইত্যাদি নিয়ে বিস্তৃত প্রোগ্রাম...",

          tagsLabel: "ট্যাগ (কমা দ্বারা পৃথক)",
          tagsPlaceholder: "Cloud, Security, Networking",

          durationLabel: "সময়কাল",
          durationPlaceholder: "১২ সপ্তাহ",

          levelLabel: "স্তর",

          nsqfLabel: "NSQF লেভেল",
          nsqfPlaceholder: "4",

          cancel: "বাতিল",
          submitAdd: "কোর্স যোগ করুন",
          submitUpdate: "কোর্স আপডেট করুন",
        },

        alerts: {
          noAbContext: "কনটেক্সটে অথরিটি বডি আইডি (AB ID) পাওয়া যায়নি।",
          requiredFields: "দয়া করে সব প্রয়োজনীয় ঘরগুলো পূরণ করুন।",
          noAbIdSave: "অথরিটি বডি আইডি (AB ID) ছাড়া কোর্স সংরক্ষণ করা যাবে না।",
          noAbIdDelete: "অথরিটি বডি আইডি (AB ID) ছাড়া কোর্স মুছে ফেলা যাবে না।",
          saveFailed: "কোর্স সংরক্ষণ করতে ব্যর্থ।",
          loadFailed: "কোর্স লোড করতে ব্যর্থ।",
          deleteFailed: "কোর্স মুছে ফেলতে ব্যর্থ।",
          confirmDelete: "আপনি কি নিশ্চিত যে আপনি এই কোর্সটি মুছে ফেলতে চান?",
        },

        tableExport: {
          filename: "courses",
        },
      },

      profile: {
        title: "প্রোফাইল সেটিংস",

        buttons: {
          editProfile: "প্রোফাইল সম্পাদনা করুন",
          cancel: "বাতিল",
          saveChanges: "পরিবর্তন সংরক্ষণ করুন",
          changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
          updatePassword: "পাসওয়ার্ড আপডেট করুন",
        },

        header: {
          roleFallback: "অথরিটি বডি",
        },

        fields: {
          fullName: "পূর্ণ নাম",
          emailAddress: "ইমেল ঠিকানা",
          emailNote: "ইমেল পরিবর্তন করা যাবে না",
          phoneNumber: "ফোন নম্বর",
          department: "বিভাগ",
          role: "ভূমিকা",
          roleNote: "ভূমিকা পরিবর্তন করা যাবে না",
          joinedDate: "যোগদানের তারিখ",
          joinedDateEmpty: "-",
        },

        security: {
          title: "নিরাপত্তা সেটিংস",
          subtitle: "আপনার অ্যাকাউন্ট নিরাপদ রাখতে পাসওয়ার্ড আপডেট করুন",
          currentPassword: "বর্তমান পাসওয়ার্ড",
          currentPasswordPlaceholder: "বর্তমান পাসওয়ার্ড লিখুন",
          newPassword: "নতুন পাসওয়ার্ড",
          newPasswordPlaceholder:
            "নতুন পাসওয়ার্ড লিখুন (সর্বনিম্ন {{min}} অক্ষর)",
          confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
          confirmNewPasswordPlaceholder: "নতুন পাসওয়ার্ড আবার লিখুন",
          cancel: "বাতিল",
          updating: "আপডেট হচ্ছে...",
        },

        messages: {
          profileUpdateSuccess: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
          profileUpdateFailure:
            "প্রোফাইল আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
          passwordMismatch: "নতুন পাসওয়ার্ডগুলো মেলেনি!",
          passwordMinLength: "পাসওয়ার্ড কমপক্ষে {{min}} অক্ষরের হতে হবে!",
          passwordChangeSuccess: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!",
          passwordChangeInvalid:
            "বর্তমান পাসওয়ার্ড সঠিক নয় অথবা নতুন পাসওয়ার্ড অকার্যকর!",
          passwordChangeFailure:
            "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
        },

        loadingStates: {
          saving: "সংরক্ষণ করা হচ্ছে...",
        },
      },

      // inside resources.bn.translation
      layout: {
        brand: {
          title: "অথরিটি পোর্টাল",
          subtitle: "অ্যাডমিন ড্যাশবোর্ড",
        },
        nav: {
          dashboard: "ড্যাশবোর্ড",
          certificates: "সনদ অনুরোধ",
          claims: "কোর্স দাবি",
          agencies: "এজেন্সি",
          courses: "কোর্স",
          profile: "প্রোফাইল",
        },
        language: {
          label: "ভাষা",
          options: {
            en: "English",
            hi: "हिन्दी",
            ta: "தமிழ்",
            bn: "বাংলা",
          },
        },
        userBlock: {
          fallbackEmailName: "অথরিটি অ্যাডমিন",
          fallbackRole: "অথরিটি বডি",
        },
        mobileMenu: {
          viewProfile: "প্রোফাইল দেখুন",
          logout: "লগআউট",
        },
      },
    },
  },
} as const;

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
