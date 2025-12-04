// src/pages/Courses.tsx
import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  BookOpen,
  Tag,
  Clock,
  BarChart3,
  Hash,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import { useAuth } from "../context/AuthContext";
import {
  Course,
  getCoursesForAuthority,
  createCourseForAuthority,
  updateCourseForAuthority,
  deleteCourseForAuthority,
} from "../firebase/course-service";

const Courses: React.FC = () => {
  const { abId } = useAuth(); // Authority_Bodies doc id (uid)
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    duration: "",
    level: "Beginner",
    nsqfLevel: "", // string for input, converted to number
  });

  /* ---------- load courses for this Authority Body ---------- */
  useEffect(() => {
    const load = async () => {
      if (!abId) {
        setError("No Authority Body id (abId) in context.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getCoursesForAuthority(abId);
        setCourses(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [abId]);

  /* ---------- derived list ---------- */
  const filteredCourses = courses.filter((course) => {
    const title = course.courseName.toLowerCase();
    const desc = (course.description || "").toLowerCase();
    const tags = (course.tags || []).map((t) => t.toLowerCase());
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      title.includes(q) ||
      desc.includes(q) ||
      tags.some((t) => t.includes(q));

    const level = course.level || "";
    const matchesLevel =
      levelFilter === "All" || level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const handleExport = () => {
    const exportData = filteredCourses.map((c) => ({
      ID: c.id,
      Title: c.courseName,
      CourseCode: c.courseCode,
      Description: c.description,
      Tags: (c.tags || []).join("; "),
      Duration: c.duration,
      Level: c.level,
      NSQF_Level: c.nsqfLevel ?? "",
    }));
    exportToCSV(exportData, "courses");
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      tags: "",
      duration: "",
      level: "Beginner",
      nsqfLevel: "",
    });
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.courseName,
      description: course.description || "",
      tags: (course.tags || []).join(", "),
      duration: course.duration || "",
      level: course.level || "Beginner",
      nsqfLevel:
        typeof course.nsqfLevel === "number"
          ? String(course.nsqfLevel)
          : "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      tags: "",
      duration: "",
      level: "Beginner",
      nsqfLevel: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.duration) {
      alert("Please fill in all required fields");
      return;
    }
    if (!abId) {
      alert("No Authority Body id (abId). Cannot save course.");
      return;
    }

    const tagsArr = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const nsqfVal = formData.nsqfLevel.trim();
    const nsqfLevel =
      nsqfVal === "" ? null : Number.isNaN(Number(nsqfVal))
        ? null
        : Number(nsqfVal);

    try {
      if (editingCourse) {
        // UPDATE
        const updated = await updateCourseForAuthority(abId, editingCourse.id, {
          courseName: formData.title,
          description: formData.description,
          duration: formData.duration,
          level: formData.level,
          tags: tagsArr,
          nsqfLevel,
        });

        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        // CREATE
        const created = await createCourseForAuthority(abId, {
          courseName: formData.title,
          description: formData.description,
          duration: formData.duration,
          level: formData.level,
          tags: tagsArr,
          nsqfLevel,
        });

        setCourses((prev) => [...prev, created]);
      }

      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save course");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    if (!abId) {
      alert("No Authority Body id (abId). Cannot delete course.");
      return;
    }

    try {
      await deleteCourseForAuthority(abId, id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete course");
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: "bg-green-100 text-green-700",
      Intermediate: "bg-blue-100 text-blue-700",
      Advanced: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          colors[level] || "bg-gray-100 text-gray-700"
        }`}
      >
        {level || "N/A"}
      </span>
    );
  };

  if (loading) {
    return <p className="p-6 text-gray-700">Loading courses…</p>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Course Management
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Filters + list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses by title, description, or tags..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="pl-11 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[160px]"
            >
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {course.courseName}
                      </h3>
                      {course.courseCode && (
                        <span className="inline-flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full ml-2">
                          <Hash className="w-3 h-3" />
                          <span>{course.courseCode}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || "—"}</span>
                </div>
                <div>{getLevelBadge(course.level)}</div>
                {course.nsqfLevel !== null && (
                  <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                    NSQF {course.nsqfLevel}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {(course.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="text-center text-gray-500 py-12">No courses found</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Advanced Data Analytics"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Comprehensive program covering data mining, statistical analysis..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cloud, Security, Networking"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12 weeks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NSQF Level
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.nsqfLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nsqfLevel: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingCourse ? "Update Course" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
