import React, { useState, useEffect } from 'react';
import { FileCheck, Building2, BookOpen, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  data: any;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    {
      url: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop',
      title: 'Excellence in Education Assessment',
      subtitle: 'Ensuring Quality Standards Nationwide',
    },
    {
      url: 'https://images.pexels.com/photos/5676744/pexels-photo-5676744.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop',
      title: 'Empowering Assessment Agencies',
      subtitle: 'Building a Better Future Together',
    },
    {
      url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop',
      title: 'Certification You Can Trust',
      subtitle: 'Verified by National Authority',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'Total Agencies',
      value: data.agencies.length,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Courses',
      value: data.courses.filter((c: any) => c.status === 'Active').length,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Pending Certificate Requests',
      value: data.certificateRequests.filter((r: any) => r.status === 'Pending').length,
      icon: FileCheck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Pending Course Claims',
      value: data.courseClaimRequests.filter((r: any) => r.status === 'Pending').length,
      icon: Clock,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const recentActivity = [
    ...data.certificateRequests
      .filter((r: any) => r.status === 'Pending')
      .slice(0, 3)
      .map((r: any) => ({
        type: 'Certificate Request',
        title: `${r.studentName} - ${r.courseTitle}`,
        date: r.submittedDate,
        status: 'Pending Review',
      })),
    ...data.courseClaimRequests
      .filter((r: any) => r.status === 'Pending')
      .slice(0, 2)
      .map((r: any) => ({
        type: 'Course Claim',
        title: `${r.agencyName} - ${r.courseTitle}`,
        date: r.submittedDate,
        status: 'Pending Review',
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="space-y-8">
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 max-w-2xl">
                {image.title}
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl">{image.subtitle}</p>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
