import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockProducts';
import {
  Package,
  Users,
  MessageCircle,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      label: 'Total Products',
      value: mockProducts.length,
      icon: Package,
      change: '+12%',
      color: 'primary',
    },
    {
      label: 'Pending Approvals',
      value: 5,
      icon: Clock,
      change: '3 new',
      color: 'amber',
    },
    {
      label: 'Community Contributors',
      value: 1234,
      icon: Users,
      change: '+8%',
      color: 'sage',
    },
    {
      label: 'AI Chat Sessions',
      value: 856,
      icon: MessageCircle,
      change: '+24%',
      color: 'terracotta',
    },
  ];

  const pendingSubmissions = [
    {
      id: '1',
      productName: 'Wild Honey',
      location: 'Sundarbans, West Bengal',
      submittedBy: 'Raju Das',
      date: '2024-01-20',
    },
    {
      id: '2',
      productName: 'Bamboo Basket',
      location: 'Tripura',
      submittedBy: 'Mita Devi',
      date: '2024-01-19',
    },
    {
      id: '3',
      productName: 'Jaggery',
      location: 'Karnataka',
      submittedBy: 'Ramesh Kumar',
      date: '2024-01-18',
    },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
            🏺
          </div>
          <span className="font-display font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 mb-8 p-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
                🏺
              </div>
              <div>
                <span className="font-display font-bold text-foreground">LocalFinds</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-border space-y-2">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Eye className="h-5 w-5" />
                  View Site
                </Button>
              </Link>
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="hero" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Products */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Recent Products
                </h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {mockProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.category.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Pending Approvals
                </h2>
                <Badge variant="outline" className="bg-amber/10 text-amber border-amber/20">
                  {pendingSubmissions.length} pending
                </Badge>
              </div>
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {submission.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {submission.location}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{submission.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Submitted by: {submission.submittedBy}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="sage" size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
