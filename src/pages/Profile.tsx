// // src/pages/Profile.tsx
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   User as UserIcon,
//   Mail,
//   Phone,
//   Briefcase,
//   Calendar,
//   Lock,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";

// const Profile: React.FC = () => {
//   const { user, profile, updateProfile, changePassword } = useAuth();

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPasswordForm, setShowPasswordForm] = useState(false);
//   const [message, setMessage] = useState<{
//     type: "success" | "error";
//     text: string;
//   } | null>(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     department: "",
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // When profile loads/changes, sync into formData (so fields show existing values)
//   useEffect(() => {
//     setFormData({
//       name: profile?.name || "",
//       phone: profile?.phone || "",
//       department: profile?.department || "",
//     });
//   }, [profile]);

//   const handleSaveProfile = async () => {
//     await updateProfile(formData);
//     setIsEditing(false);
//     setMessage({ type: "success", text: "Profile updated successfully!" });
//     setTimeout(() => setMessage(null), 3000);
//   };

//   const handleCancelEdit = () => {
//     setFormData({
//       name: profile?.name || "",
//       phone: profile?.phone || "",
//       department: profile?.department || "",
//     });
//     setIsEditing(false);
//   };

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage(null);

//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setMessage({ type: "error", text: "New passwords do not match!" });
//       return;
//     }

//     if (passwordData.newPassword.length < 6) {
//       setMessage({
//         type: "error",
//         text: "Password must be at least 6 characters long!",
//       });
//       return;
//     }

//     const success = await changePassword(
//       passwordData.currentPassword,
//       passwordData.newPassword
//     );

//     if (success) {
//       setMessage({ type: "success", text: "Password changed successfully!" });
//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//       setShowPasswordForm(false);
//       setTimeout(() => setMessage(null), 3000);
//     } else {
//       setMessage({
//         type: "error",
//         text: "Current password is incorrect or new password is invalid!",
//       });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

//       {message && (
//         <div
//           className={`p-4 rounded-lg flex items-start space-x-3 ${
//             message.type === "success"
//               ? "bg-green-50 border border-green-200"
//               : "bg-red-50 border border-red-200"
//           }`}
//         >
//           {message.type === "success" ? (
//             <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//           ) : (
//             <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//           )}
//           <p
//             className={`text-sm ${
//               message.type === "success" ? "text-green-800" : "text-red-800"
//             }`}
//           >
//             {message.text}
//           </p>
//         </div>
//       )}

//       {/* PROFILE CARD */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
//         <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
//           <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
//             <UserIcon className="w-12 h-12 text-white" />
//           </div>
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {profile?.name ||
//                 user?.displayName ||
//                 profile?.email ||
//                 user?.email}
//             </h2>
//             <p className="text-gray-600">{profile?.role || "Authority Body"}</p>
//             <p className="text-sm text-gray-500 mt-1">
//               {profile?.email || user?.email}
//             </p>
//           </div>
//           {!isEditing && (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Edit Profile
//             </button>
//           )}
//         </div>

//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Full Name */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <UserIcon className="w-4 h-4" />
//                 <span>Full Name</span>
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               ) : (
//                 <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
//                   {profile?.name}
//                 </p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <Mail className="w-4 h-4" />
//                 <span>Email Address</span>
//               </label>
//               <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
//                 {profile?.email || user?.email}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 Email cannot be changed
//               </p>
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <Phone className="w-4 h-4" />
//                 <span>Phone Number</span>
//               </label>
//               {isEditing ? (
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) =>
//                     setFormData({ ...formData, phone: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               ) : (
//                 <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
//                   {profile?.phone}
//                 </p>
//               )}
//             </div>

//             {/* Department */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <Briefcase className="w-4 h-4" />
//                 <span>Department</span>
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={formData.department}
//                   onChange={(e) =>
//                     setFormData({ ...formData, department: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               ) : (
//                 <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
//                   {profile?.department}
//                 </p>
//               )}
//             </div>

//             {/* Role */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <Briefcase className="w-4 h-4" />
//                 <span>Role</span>
//               </label>
//               <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
//                 {profile?.role || "authority_body"}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 Role cannot be changed
//               </p>
//             </div>

//             {/* Joined Date */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="w-4 h-4" />
//                 <span>Joined Date</span>
//               </label>
//               <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
//                 {profile?.joinedDate || "-"}
//               </p>
//             </div>
//           </div>

//           {isEditing && (
//             <div className="flex space-x-3 pt-6 border-t border-gray-200">
//               <button
//                 onClick={handleCancelEdit}
//                 className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveProfile}
//                 className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 Save Changes
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* SECURITY SETTINGS */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h3 className="text-lg font-bold text-gray-900 mb-1">
//               Security Settings
//             </h3>
//             <p className="text-sm text-gray-600">
//               Update your password to keep your account secure
//             </p>
//           </div>
//           {!showPasswordForm && (
//             <button
//               onClick={() => setShowPasswordForm(true)}
//               className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//             >
//               <Lock className="w-4 h-4" />
//               <span>Change Password</span>
//             </button>
//           )}
//         </div>

//         {showPasswordForm && (
//           <form onSubmit={handleChangePassword} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Current Password
//               </label>
//               <input
//                 type="password"
//                 value={passwordData.currentPassword}
//                 onChange={(e) =>
//                   setPasswordData({
//                     ...passwordData,
//                     currentPassword: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter current password"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 New Password
//               </label>
//               <input
//                 type="password"
//                 value={passwordData.newPassword}
//                 onChange={(e) =>
//                   setPasswordData({
//                     ...passwordData,
//                     newPassword: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter new password (min 6 characters)"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm New Password
//               </label>
//               <input
//                 type="password"
//                 value={passwordData.confirmPassword}
//                 onChange={(e) =>
//                   setPasswordData({
//                     ...passwordData,
//                     confirmPassword: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Re-enter new password"
//                 required
//               />
//             </div>

//             <div className="flex space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowPasswordForm(false);
//                   setPasswordData({
//                     currentPassword: "",
//                     newPassword: "",
//                     confirmPassword: "",
//                   });
//                 }}
//                 className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 Update Password
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;

// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2, // loader icon
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, profile, updateProfile, changePassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // When profile loads/changes, sync into formData (so fields show existing values)
  useEffect(() => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
    });
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateProfile(formData);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long!",
      });
      return;
    }

    try {
      setChangingPassword(true);

      const success = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (success) {
        setMessage({
          type: "success",
          text: "Password changed successfully!",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Current password is incorrect or new password is invalid!",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Failed to change password. Please try again.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.name ||
                user?.displayName ||
                profile?.email ||
                user?.email}
            </h2>
            <p className="text-gray-600">{profile?.role || "Authority Body"}</p>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.email || user?.email}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4" />
                <span>Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                  {profile?.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </label>
              <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
                {profile?.email || user?.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                  {profile?.phone}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                <span>Department</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                  {profile?.department}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                <span>Role</span>
              </label>
              <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
                {profile?.role || "authority_body"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Role cannot be changed
              </p>
            </div>

            {/* Joined Date */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Joined Date</span>
              </label>
              <p className="text-gray-900 px-4 py-3 bg-gray-100 rounded-lg cursor-not-allowed">
                {profile?.joinedDate || "-"}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancelEdit}
                disabled={savingProfile}
                className={`flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg transition-colors font-medium ${
                  savingProfile
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
                  savingProfile
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECURITY SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Security Settings
            </h3>
            <p className="text-sm text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (changingPassword) return;
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                disabled={changingPassword}
                className={`flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg transition-colors font-medium ${
                  changingPassword
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
                  changingPassword
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {changingPassword && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {changingPassword ? "Updating..." : "Update Password"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
