import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import AddProductDialog from '@/components/admin/AddProductDialog';
import ReviewDialog from '@/components/admin/ReviewDialog';
import {
  Package, Users, MessageCircle, TrendingUp, Plus, Edit, Trash2,
  Eye, LogOut, Menu, X, CheckCircle, Clock, BarChart3, Settings, Bell,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const {
    products, recentProducts, pendingProducts, approvedCount, reviewedCount,
    loading: productsLoading, addProduct, approveProduct, reviewProduct, deleteProduct,
  } = useProducts();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string; comment?: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="text-4xl mb-4">🏺</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, change: `${approvedCount} approved`, color: 'primary' },
    { label: 'Pending Approvals', value: pendingProducts.length, icon: Clock, change: `${pendingProducts.length} new`, color: 'amber' },
    { label: 'Reviewed Products', value: reviewedCount, icon: CheckCircle, change: `${reviewedCount} total`, color: 'sage' },
    { label: 'Approved Products', value: approvedCount, icon: TrendingUp, change: `${Math.round((approvedCount / Math.max(products.length, 1)) * 100)}%`, color: 'terracotta' },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const openReview = (product: { id: string; name: string; review_comment?: string | null }) => {
    setReviewingProduct({ id: product.id, name: product.name, comment: product.review_comment || '' });
    setReviewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">🏺</div>
          <span className="font-display font-bold">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-4">
            <div className="hidden lg:flex items-center gap-3 mb-8 p-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">🏺</div>
              <div>
                <span className="font-display font-bold text-foreground">LocalFinds</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-border space-y-2">
              <Link to="/"><Button variant="ghost" className="w-full justify-start gap-3"><Eye className="h-5 w-5" />View Site</Button></Link>
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />Logout
              </Button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="hero" className="gap-2" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-5 w-5" />Add Product
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Products */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Recent Products</h2>
                <Badge variant="secondary">{recentProducts.length} latest</Badge>
              </div>
              <div className="space-y-4">
                {recentProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No products yet. Add your first product!</p>
                ) : (
                  recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{product.category_icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{product.category_name}</span>
                          <Badge variant={product.review_status === 'approved' ? 'default' : product.review_status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                            {product.review_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openReview(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Pending Approvals</h2>
                <Badge variant="outline">{pendingProducts.length} pending</Badge>
              </div>
              <div className="space-y-4">
                {pendingProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No pending approvals 🎉</p>
                ) : (
                  pendingProducts.map((product) => (
                    <div key={product.id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.location_state}{product.location_district ? `, ${product.location_district}` : ''}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{product.category_icon} {product.category_name}</p>
                      <div className="flex gap-2">
                        <Button variant="sage" size="sm" className="flex-1" onClick={() => approveProduct(product.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Approve
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openReview(product)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={addProduct} />
      {reviewingProduct && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          productName={reviewingProduct.name}
          currentComment={reviewingProduct.comment}
          onSubmit={(status, comment) => reviewProduct(reviewingProduct.id, status, comment)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
