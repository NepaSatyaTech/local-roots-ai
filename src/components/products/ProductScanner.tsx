import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ScanLine, X, Camera, CameraOff } from 'lucide-react';
import type { DbProduct } from '@/hooks/useProducts';

const ProductScanner = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DbProduct[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${q}%,category_name.ilike.%${q}%,location_state.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      setResults((data as unknown as DbProduct[]) || []);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setCapturedImage(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access was denied. Please allow camera permissions in your browser settings.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();

    // Use AI to analyze the captured image
    setLoading(true);
    setSearched(true);
    try {
      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Analyze this product image and identify the product name in 1-3 words only. Just respond with the product name, nothing else. Image: ${imageDataUrl.substring(0, 500)}`,
            }
          ],
        },
      });
      
      if (response.data) {
        const reader = response.data.getReader?.();
        if (reader) {
          let text = '';
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
          }
          const productName = text.trim().substring(0, 50);
          setQuery(productName);
          await handleSearch(productName);
        }
      }
    } catch {
      // Fallback: just prompt user to type
      setLoading(false);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <ScanLine className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Product Scanner</h2>
        <p className="text-muted-foreground mt-1">Search by text or scan with your camera</p>
      </div>

      {/* Camera Section */}
      <div className="max-w-xl mx-auto">
        {!cameraActive && !capturedImage && (
          <Button onClick={startCamera} variant="outline" className="w-full gap-2 mb-4">
            <Camera className="h-5 w-5" /> Open Camera to Scan
          </Button>
        )}

        {cameraActive && (
          <div className="relative rounded-2xl overflow-hidden border border-border mb-4">
            <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary/60 rounded-xl" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button onClick={captureAndAnalyze} variant="hero" className="gap-2">
                <ScanLine className="h-5 w-5" /> Capture & Scan
              </Button>
              <Button onClick={stopCamera} variant="outline" className="gap-2">
                <CameraOff className="h-5 w-5" /> Close
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="mb-4">
            <img src={capturedImage} alt="Captured" className="w-full rounded-2xl border border-border" />
            <Button onClick={() => { setCapturedImage(null); startCamera(); }} variant="outline" className="mt-2 w-full gap-2">
              <Camera className="h-4 w-4" /> Scan Again
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter product name, category, or location..."
            className="pl-10"
          />
        </div>
        {searched && (
          <Button variant="ghost" size="icon" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={() => handleSearch()} disabled={loading || !query.trim()} variant="hero">
          {loading ? 'Scanning...' : 'Scan'}
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <div className="max-w-3xl mx-auto">
          {results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{results.length} product(s) found</p>
              {results.map(product => (
                <div key={product.id} className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category_icon} {product.category_name} • {product.location_state}{product.location_district ? `, ${product.location_district}` : ''}
                      </p>
                    </div>
                    <Badge variant={product.review_status === 'approved' ? 'default' : 'secondary'}>
                      {product.review_status}
                    </Badge>
                  </div>
                  {product.description && <p className="text-sm text-muted-foreground mb-3">{product.description}</p>}
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {product.importance && (
                      <div><span className="font-medium text-foreground">Importance:</span> <span className="text-muted-foreground">{product.importance}</span></div>
                    )}
                    {product.daily_life_uses && (
                      <div><span className="font-medium text-foreground">Daily Uses:</span> <span className="text-muted-foreground">{product.daily_life_uses}</span></div>
                    )}
                    {product.how_to_use && (
                      <div><span className="font-medium text-foreground">How to Use:</span> <span className="text-muted-foreground">{product.how_to_use}</span></div>
                    )}
                    {product.where_to_find && (
                      <div><span className="font-medium text-foreground">Where to Find:</span> <span className="text-muted-foreground">{product.where_to_find}</span></div>
                    )}
                    {product.price && (
                      <div><span className="font-medium text-foreground">Price:</span> <span className="text-muted-foreground">{product.price}</span></div>
                    )}
                    {product.cultural_background && (
                      <div className="sm:col-span-2"><span className="font-medium text-foreground">Cultural Background:</span> <span className="text-muted-foreground">{product.cultural_background}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Product not found</h3>
              <p className="text-muted-foreground mb-4">This product isn't registered yet. You can contribute its information through our community chatbot!</p>
              <Button variant="outline" onClick={() => window.location.href = '/chat'}>
                Open AI Chatbot
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductScanner;
