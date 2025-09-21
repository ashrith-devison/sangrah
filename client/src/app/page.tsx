import React from 'react';
import {
  Shield,
  Upload,
  Search,
  Share2,
  BarChart3,
  Lock,
  Database,
  ArrowRight,
  CheckCircle,
  Star,
  Github,
  Play,
  FileText,
  Image,
  Video,
  Download,
} from 'lucide-react';
import { ExploreNowButton } from '@/components/common/ExploreNowButton';

export default function Page() {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Deduplication',
      description:
        'Smart content hashing with SHA256 prevents duplicate storage, saving space and costs automatically.',
    },
    {
      icon: Upload,
      title: 'Seamless Upload Experience',
      description:
        'Drag-and-drop multiple files with MIME type validation and real-time progress tracking.',
    },
    {
      icon: Search,
      title: 'Powerful Search & Filtering',
      description:
        'Find files instantly with advanced filters by type, size, date, tags, and uploader.',
    },
    {
      icon: Share2,
      title: 'Flexible Sharing Options',
      description:
        'Share files publicly, privately, or with specific users. Track download statistics in real-time.',
    },
    {
      icon: BarChart3,
      title: 'Storage Analytics',
      description:
        'Monitor storage usage, deduplication savings, and detailed file statistics.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description:
        'Rate limiting, storage quotas, and role-based access control for complete security.',
    },
  ];

  const techStack = [
    { name: 'Go', color: 'bg-blue-500' },
    { name: 'GraphQL', color: 'bg-pink-500' },
    { name: 'PostgreSQL', color: 'bg-blue-600' },
    { name: 'Next.js', color: 'bg-cyan-500' },
    { name: 'TypeScript', color: 'bg-blue-700' },
    { name: 'Docker', color: 'bg-blue-400' },
  ];

  const stats = [
    {
      label: 'Storage Efficiency',
      value: '95%',
      subtext: 'Average deduplication savings',
    },
    {
      label: 'Search Performance',
      value: '<100ms',
      subtext: 'Average query response time',
    },
    { label: 'Uptime', value: '99.9%', subtext: 'Production reliability' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-zinc-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">File Vault</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#tech"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Technology
              </a>
              <a
                href="#demo"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Demo
              </a>
              <ExploreNowButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6e73fa]/20 to-[#5e5e5e]/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#6e73fa]/20 border border-[#6e73fa]/30 rounded-full text-[#6e73fa] text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              File Vault
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Secure File Vault
              <span className="block bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              A production-grade file management system featuring intelligent
              deduplication, advanced search capabilities, and enterprise-level
              security controls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] hover:from-[#5e5e5e] hover:to-[#6e73fa] text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl shadow-[#6e73fa]/25 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                View Live Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all backdrop-blur-sm border border-zinc-700 flex items-center">
                <Github className="w-5 h-5 mr-2" />
                View Source Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with modern technologies and best practices for
              enterprise-grade performance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800 transition-all duration-300 hover:border-[#6e73fa]/50 hover:shadow-2xl hover:shadow-[#6e73fa]/10"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-20 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Modern Tech Stack
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technologies for optimal performance and
              scalability
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="flex items-center bg-zinc-800 backdrop-blur-sm border border-zinc-700 rounded-full px-6 py-3 hover:bg-zinc-700 transition-all"
              >
                <div
                  className={`w-3 h-3 ${tech.color} rounded-full mr-3`}
                ></div>
                <span className="text-white font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#6e73fa]/10 to-[#5e5e5e]/10 backdrop-blur-sm border border-[#6e73fa]/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Backend</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Go
                  with GraphQL API
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />{' '}
                  PostgreSQL Database
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Docker
                  Containerization
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#6e73fa]/10 to-[#5e5e5e]/10 backdrop-blur-sm border border-[#6e73fa]/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Frontend</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />{' '}
                  Next.js with TypeScript
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />{' '}
                  Tailwind CSS Styling
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />{' '}
                  Responsive Design
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#5e5e5e]/10 to-[#6e73fa]/10 backdrop-blur-sm border border-[#6e73fa]/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">DevOps</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> CI/CD
                  Pipeline
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />{' '}
                  Automated Testing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Cloud
                  Deployment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the power of intelligent file management with our live
              demo
            </p>
          </div>
          <div className="bg-gradient-to-r from-[#6e73fa]/10 to-[#5e5e5e]/10 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Interactive Demo
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-300">
                    <Upload className="w-5 h-5 text-purple-400 mr-3" />
                    Upload multiple files with drag & drop
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Search className="w-5 h-5 text-purple-400 mr-3" />
                    Advanced search and filtering
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Share2 className="w-5 h-5 text-purple-400 mr-3" />
                    Flexible sharing options
                  </div>
                  <div className="flex items-center text-gray-300">
                    <BarChart3 className="w-5 h-5 text-purple-400 mr-3" />
                    Real-time analytics dashboard
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-4 text-sm text-gray-400">File Vault</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-white">document.pdf</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Download className="w-3 h-3 mr-1" />
                        1.2k
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center">
                        <Image className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-sm text-white">
                          presentation.jpg
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Download className="w-3 h-3 mr-1" />
                        856
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center">
                        <Video className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-sm text-white">demo.mp4</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Download className="w-3 h-3 mr-1" />
                        342
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">File Vault</span>
            </div>
            <div className="text-gray-400 text-sm">
              Built for Balkan Vault Full Stack Engineering Internship • 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
