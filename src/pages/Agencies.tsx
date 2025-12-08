// src/pages/Agencies.tsx
import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  BookOpen,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import { useAuth } from "../context/AuthContext";
import {
  Agency,
  AgencyInput,
  getAgenciesForAuthority,
  createAgencyForAuthority,
  updateAgency,
  deleteAgencyForAuthority,
  updateAgencyAuthEmail,
  deleteAgencyAuth,
} from "../firebase/agency-service";
import {
  Course,
  getCoursesForAuthority,
  getCoursesForAgency,
  addAgencyToCourse,
  removeAgencyFromCourse,
} from "../firebase/course-service";
import { useTranslation } from "react-i18next";

const Agencies: React.FC = () => {
  const { abId } = useAuth();
  const { t } = useTranslation();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [coursesByAgency, setCoursesByAgency] = useState<
    Record<string, Course[]>
  >({});
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    location: "",
    phone: "",
    website: "",
    coursesOffered: "",
  });

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [previousCourseIds, setPreviousCourseIds] = useState<string[]>([]);

  // 1) Load agencies for this AB
  useEffect(() => {
    const load = async () => {
      if (!abId) {
        setError(t("agencies.alerts.noAbContext"));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getAgenciesForAuthority(abId);
        setAgencies(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("agencies.alerts.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [abId, t]);

  // 2) Load all courses for this AB (for multi-select list)
  useEffect(() => {
    const loadCourses = async () => {
      if (!abId) return;
      try {
        const courses = await getCoursesForAuthority(abId);
        setAllCourses(courses);
      } catch (err) {
        console.error("Failed to load courses for authority", err);
      }
    };
    loadCourses();
  }, [abId]);

  // 3) Load per-agency linked courses (for "Courses Offered" chips)
  useEffect(() => {
    const loadCoursesForAll = async () => {
      if (!abId) return;

      const map: Record<string, Course[]> = {};

      for (const agency of agencies) {
        const courses = await getCoursesForAgency(agency.id, [abId]);
        map[agency.id] = courses;
      }

      setCoursesByAgency(map);
    };

    if (agencies.length > 0) {
      loadCoursesForAll();
    } else {
      setCoursesByAgency({});
    }
  }, [agencies, abId]);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredAgencies.map((a) => ({
      ID: a.id,
      Name: a.name,
      Email: a.adminEmail,
      Location: a.location,
      Phone: a.phone,
      Website: a.website,
      CoursesOffered: (coursesByAgency[a.id] || [])
        .map((c) => c.courseName)
        .join("; "),
      Status: a.status,
      RegisteredDate: a.registeredDate,
      TotalCertificates: a.totalCertificates,
    }));
    exportToCSV(exportData, t("agencies.tableExport.filename"));
  };

  const openAddModal = () => {
    setEditingAgency(null);
    setFormData({
      name: "",
      adminEmail: "",
      location: "",
      phone: "",
      website: "",
      coursesOffered: "",
    });
    setSelectedCourseIds([]);
    setPreviousCourseIds([]);
    setShowModal(true);
  };

  const openEditModal = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      adminEmail: agency.adminEmail,
      location: agency.location,
      phone: agency.phone,
      website: agency.website,
      coursesOffered: "",
    });

    const linkedCourses = getLinkedCoursesForAgency(agency);
    const ids = linkedCourses.map((c) => c.id);

    setSelectedCourseIds(ids);
    setPreviousCourseIds(ids);

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgency(null);
    setFormData({
      name: "",
      adminEmail: "",
      location: "",
      phone: "",
      website: "",
      coursesOffered: "",
    });
    setSelectedCourseIds([]);
    setPreviousCourseIds([]);
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const syncCoursesForAgency = async (
    agencyId: string,
    prevIds: string[],
    nextIds: string[]
  ) => {
    const prevSet = new Set(prevIds);
    const nextSet = new Set(nextIds);

    const toAdd = nextIds.filter((id) => !prevSet.has(id));
    const toRemove = prevIds.filter((id) => !nextSet.has(id));

    await Promise.all([
      ...toAdd.map((courseId) => addAgencyToCourse(agencyId, courseId)),
      ...toRemove.map((courseId) => removeAgencyFromCourse(agencyId, courseId)),
    ]);

    const updatedCourses = allCourses.filter((c) => nextSet.has(c.id));
    setCoursesByAgency((prev) => ({
      ...prev,
      [agencyId]: updatedCourses,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.adminEmail || !formData.location) {
      alert(t("agencies.alerts.requiredFields"));
      return;
    }
    if (!abId) {
      alert(t("agencies.alerts.noAbIdSave"));
      return;
    }

    const input: AgencyInput = {
      name: formData.name,
      adminEmail: formData.adminEmail,
      location: formData.location,
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      coursesOffered: selectedCourseIds,
    };

    try {
      let agencyId: string;

      if (editingAgency) {
        const oldEmail = editingAgency.adminEmail;

        const updated = await updateAgency(editingAgency.id, input);
        setAgencies((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        agencyId = updated.id;

        if (oldEmail !== formData.adminEmail) {
          await updateAgencyAuthEmail(agencyId, formData.adminEmail);
        }
      } else {
        const created = await createAgencyForAuthority(abId, input);
        setAgencies((prev) => [...prev, created]);
        agencyId = created.id;
      }

      await syncCoursesForAgency(
        agencyId,
        previousCourseIds,
        selectedCourseIds
      );

      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("agencies.alerts.saveFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("agencies.alerts.confirmDelete"))) {
      return;
    }
    if (!abId) {
      alert(t("agencies.alerts.noAbIdDelete"));
      return;
    }

    try {
      const linkedCourses = coursesByAgency[id] || [];
      await Promise.all(
        linkedCourses.map((course) => removeAgencyFromCourse(id, course.id))
      );

      await deleteAgencyForAuthority(abId, id);
      await deleteAgencyAuth(id, abId);

      setAgencies((prev) => prev.filter((a) => a.id !== id));
      setCoursesByAgency((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("agencies.alerts.deleteFailed"));
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-700">{t("agencies.loading")}</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {t("agencies.errorPrefix")}: {error}
      </div>
    );
  }

  const getLinkedCoursesForAgency = (agency: Agency): Course[] => {
    const fromMap = coursesByAgency[agency.id];
    if (fromMap && fromMap.length > 0) {
      return fromMap;
    }

    if (!agency.coursesOffered || agency.coursesOffered.length === 0) {
      return [];
    }

    return allCourses.filter((c) => agency.coursesOffered.includes(c.id));
  };

  return (
    <div className="space-y-6">
      {/* header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 ml-8">
          {t("agencies.title")}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t("agencies.header.export")}</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t("agencies.header.addAgency")}</span>
          </button>
        </div>
      </div>

      {/* cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ml-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("agencies.searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {agency.name}
                    </h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {agency.status || t("agencies.cards.statusUnknown")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{agency.adminEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{agency.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{agency.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{agency.website}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">
                    {t("agencies.cards.coursesOfferedLabel")}
                  </span>
                </div>

                {(() => {
                  const linkedCourses = getLinkedCoursesForAgency(agency);

                  return (
                    <div className="flex flex-wrap gap-1">
                      {linkedCourses.slice(0, 2).map((course) => (
                        <span
                          key={course.id}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                        >
                          {course.courseName}
                        </span>
                      ))}

                      {linkedCourses.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{linkedCourses.length - 2} more
                        </span>
                      )}

                      {linkedCourses.length === 0 && (
                        <span className="text-xs text-gray-400">
                          {t("agencies.cards.noCoursesLinked")}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(agency)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agency.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgencies.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            {t("agencies.list.empty")}
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAgency
                  ? t("agencies.modal.editTitle")
                  : t("agencies.modal.addTitle")}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.orgNameLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("agencies.modal.orgNamePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.adminEmailLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adminEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("agencies.modal.adminEmailPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.locationLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("agencies.modal.locationPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.phoneLabel")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("agencies.modal.phonePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.websiteLabel")}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      website: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("agencies.modal.websitePlaceholder")}
                />
              </div>

              {/* Course multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("agencies.modal.linkCoursesLabel")}
                </label>
                <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto p-3 space-y-1">
                  {allCourses.length === 0 && (
                    <p className="text-xs text-gray-500">
                      {t("agencies.modal.noCoursesAvailable")}
                    </p>
                  )}
                  {allCourses.map((course) => {
                    const checked = selectedCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className="flex items-start space-x-2 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300"
                          checked={checked}
                          onChange={() => toggleCourseSelection(course.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {course.courseName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("agencies.modal.courseCodeLabel")}:{" "}
                            {course.courseCode} •{" "}
                            {t("agencies.modal.nsqfLabel")}{" "}
                            {course.nsqfLevel ?? "-"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t("agencies.modal.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingAgency
                    ? t("agencies.modal.submitUpdate")
                    : t("agencies.modal.submitAdd")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencies;
