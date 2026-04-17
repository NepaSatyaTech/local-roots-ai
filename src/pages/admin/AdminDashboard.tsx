import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import AddProductDialog from '@/components/admin/AddProductDialog';
import EditProductDialog from '@/components/admin/EditProductDialog';
import ReviewDialog from '@/components/admin/ReviewDialog';
import type { DbProduct } from '@/hooks/useProducts';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useCategories } from '@/hooks/useCategories';
import type { DbCategory } from '@/hooks/useCategories';
import CategoryDialog from '@/components/admin/CategoryDialog';
import { useSupport, useSupportMessages } from '@/hooks/useSupport';
import type { SupportConversation } from '@/hooks/useSupport';
import {
  Package, TrendingUp, Plus, Edit, Trash2, Eye, LogOut, Menu, X,
  CheckCircle, Clock, BarChart3, Settings, Bell, Search, Image, Users, MessageSquare, FolderOpen, GripVertical, Send, Headphones,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable category card component
const SortableCategoryCard = ({ category, onEdit, onDelete }: { category: DbCategory; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="text-2xl">{category.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{category.name}</p>
        <p className="text-sm text-muted-foreground truncate">{category.description}</p>
      </div>
      <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{category.color}</Badge>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

// Admin chat area for support tab
const AdminChatArea = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
  const { messages, loading, sendMessage } = useSupportMessages(conversationId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg, 'admin');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-center text-muted-foreground text-sm">Loading...</p>}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              m.sender_id === userId
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="text-xs font-semibold mb-1 opacity-70">{m.sender_role === 'admin' ? 'You (Admin)' : 'Customer'}</p>
              <p>{m.message}</p>
              <p className="text-[10px] mt-1 opacity-60">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input placeholder="Type your reply..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {

  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [adminUsername, setAdminUsername] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.username) setAdminUsername(data.username);
          else if (user.email) setAdminUsername(user.email.split('@')[0]);
        });
    });
  }, [user]);
  const {
    products, recentProducts, pendingProducts, approvedCount, reviewedCount,
    loading: productsLoading, addProduct, updateProduct, approveProduct, reviewProduct, deleteProduct,
  } = useProducts();
  const { submissions, pendingSubmissions, loading: submissionsLoading, updateStatus, deleteSubmission } = useSubmissions();
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { conversations: supportConversations, loading: supportLoading, closeConversation } = useSupport();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSupportConvoId, setActiveSupportConvoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string; comment?: string } | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/admin');
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading || productsLoading || submissionsLoading || categoriesLoading || supportLoading) {
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
    { label: 'Total Products', value: products.length, icon: Package, change: `${approvedCount} approved` },
    { label: 'Pending Approvals', value: pendingProducts.length, icon: Clock, change: `${pendingProducts.length} new` },
    { label: 'Reviewed Products', value: reviewedCount, icon: CheckCircle, change: `${reviewedCount} total` },
    { label: 'Approved Products', value: approvedCount, icon: TrendingUp, change: `${Math.round((approvedCount / Math.max(products.length, 1)) * 100)}%` },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'submissions', label: 'Submissions', icon: MessageSquare },
    { id: 'support', label: 'Support Chats', icon: Headphones },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => { await signOut(); navigate('/admin'); };

  const openReview = (product: { id: string; name: string; review_comment?: string | null }) => {
    setReviewingProduct({ id: product.id, name: product.name, comment: product.review_comment || '' });
    setReviewDialogOpen(true);
  };

  const openEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const filteredProducts = products.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === 'products') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">All Products</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="hero" onClick={() => setAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add</Button>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{product.category_icon}</div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.price || 'No price'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{product.category_icon} {product.category_name}</td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">{product.location_state}{product.location_district ? `, ${product.location_district}` : ''}</td>
                      <td className="p-4">
                        <Badge variant={product.review_status === 'approved' ? 'default' : product.review_status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                          {product.review_status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openReview(product)}><Eye className="h-4 w-4" /></Button>
                          {product.review_status !== 'approved' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-sage" onClick={() => approveProduct(product.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No products found</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'categories') {
      const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = categories.findIndex(c => c.id === active.id);
        const newIndex = categories.findIndex(c => c.id === over.id);
        const reordered = arrayMove(categories, oldIndex, newIndex);
        // Update sort_order for all reordered items
        for (let i = 0; i < reordered.length; i++) {
          if (reordered[i].sort_order !== i + 1) {
            await updateCategory(reordered[i].id, { sort_order: i + 1 });
          }
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">Categories</h2>
            <Button variant="hero" onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Category
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Drag categories to reorder them.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {categories.map(cat => (
                  <SortableCategoryCard
                    key={cat.id}
                    category={cat}
                    onEdit={() => { setEditingCategory(cat); setCategoryDialogOpen(true); }}
                    onDelete={() => deleteCategory(cat.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {categories.length === 0 && (
            <div className="rounded-2xl bg-card border border-border p-12 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No categories yet</h3>
              <p className="text-muted-foreground">Create your first category to organize products</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'approvals') {
      return (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-foreground">Pending Approvals</h2>
          {pendingProducts.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-12 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No products pending approval</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingProducts.map(product => (
                <div key={product.id} className="rounded-2xl bg-card border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">{product.category_icon}</div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category_name}</p>
                      </div>
                    </div>
                  </div>
                  {product.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>}
                  <p className="text-xs text-muted-foreground mb-3">{product.location_state}{product.location_district ? `, ${product.location_district}` : ''} • {new Date(product.created_at).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button variant="sage" size="sm" className="flex-1" onClick={() => approveProduct(product.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openReview(product)}>Review</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'submissions') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">Community Submissions</h2>
            <Badge variant="secondary">{pendingSubmissions.length} pending</Badge>
          </div>
          {submissions.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-12 text-center">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">Community product suggestions will appear here</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Details</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Submitted By</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{sub.product_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">{sub.location}</td>
                        <td className="p-4 hidden lg:table-cell text-muted-foreground max-w-xs truncate">{sub.usage_details || '—'}</td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">{sub.submitted_by}</td>
                        <td className="p-4">
                          <Badge variant={sub.status === 'approved' ? 'default' : sub.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                            {sub.status || 'pending'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {sub.status !== 'approved' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-sage" onClick={() => updateStatus(sub.id, 'approved')}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {sub.status !== 'rejected' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber" onClick={() => updateStatus(sub.id, 'rejected')}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSubmission(sub.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'support') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Support Chats</h2>
            <Badge variant="secondary">{supportConversations.filter(c => c.status === 'open').length} open</Badge>
          </div>
          {activeSupportConvoId ? (
            <div>
              <button onClick={() => setActiveSupportConvoId(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
                ← Back to conversations
              </button>
              <div className="rounded-2xl bg-card border border-border overflow-hidden" style={{ height: '500px' }}>
                <AdminChatArea conversationId={activeSupportConvoId} userId={user?.id || ''} />
              </div>
            </div>
          ) : supportConversations.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-12 text-center">
              <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No support queries</h3>
              <p className="text-muted-foreground">Customer queries will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supportConversations.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveSupportConvoId(c.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{c.subject || 'No subject'}</p>
                      <Badge variant={c.status === 'open' ? 'default' : 'secondary'} className="text-xs">{c.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.user_email} • {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="sage" size="sm" onClick={() => setActiveSupportConvoId(c.id)}>Reply</Button>
                    {c.status === 'open' && (
                      <Button variant="outline" size="sm" onClick={() => closeConversation(c.id)}>Close</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'analytics') {
      const categoryBreakdown = products.reduce((acc, p) => {
        acc[p.category_name] = (acc[p.category_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-foreground">Analytics</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Approved', count: approvedCount, color: 'bg-sage' },
                  { label: 'Pending', count: pendingProducts.length, color: 'bg-amber' },
                  { label: 'Rejected', count: products.filter(p => p.review_status === 'rejected').length, color: 'bg-destructive' },
                  { label: 'Needs Changes', count: products.filter(p => p.review_status === 'needs_changes').length, color: 'bg-primary' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{cat}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
                {Object.keys(categoryBreakdown).length === 0 && (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Overview (default)
    return (
      <>
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
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{product.category_icon}</div>
                    )}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
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
                pendingProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.location_state}{product.location_district ? `, ${product.location_district}` : ''}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="sage" size="sm" className="flex-1" onClick={() => approveProduct(product.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />Approve
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openReview(product)}>Review</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
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
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-2">
              {adminUsername && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Hi, {adminUsername}</span>
                </div>
              )}
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="hero" className="gap-2" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-5 w-5" />Add Product
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-5 w-5" /><span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Dialogs */}
      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={addProduct} />
      <EditProductDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} product={editingProduct} onSubmit={updateProduct} />
      {reviewingProduct && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          productName={reviewingProduct.name}
          currentComment={reviewingProduct.comment}
          onSubmit={(status, comment) => reviewProduct(reviewingProduct.id, status, comment)}
        />
      )}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSubmit={async (data) => {
          if (editingCategory) return updateCategory(editingCategory.id, data);
          return addCategory(data);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
