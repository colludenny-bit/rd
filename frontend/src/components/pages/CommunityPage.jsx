import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Users, Heart, MessageCircle, Share2, Plus, Image as ImageIcon, TrendingUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CommunityPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    profit: 0
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/community/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/community/posts`, formData);
      toast.success('Post pubblicato!');
      fetchPosts();
      setShowForm(false);
      setFormData({ image_url: '', caption: '', profit: 0 });
    } catch (error) {
      toast.error('Errore nella pubblicazione');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API}/community/posts/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s fa`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`;
    return `${Math.floor(diff / 86400)}g fa`;
  };

  return (
    <div className="space-y-6 fade-in" data-testid="community-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              {t('community.title')}
            </h1>
            <p className="text-muted-foreground mt-1">Condividi i tuoi successi con la community</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl"
            data-testid="new-post-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Post
          </Button>
        </div>
      </motion.div>

      {/* New Post Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-card/80 border-border/50" data-testid="post-form">
            <CardHeader>
              <CardTitle>Condividi il tuo Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Screenshot</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                    className="bg-secondary/50"
                    data-testid="image-url-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrizione</label>
                  <Textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({...formData, caption: e.target.value})}
                    placeholder="Racconta il tuo trade..."
                    className="bg-secondary/50"
                    data-testid="caption-textarea"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profitto ($)</label>
                  <Input
                    type="number"
                    value={formData.profit}
                    onChange={(e) => setFormData({...formData, profit: parseFloat(e.target.value)})}
                    className="bg-secondary/50"
                    data-testid="profit-input"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1 rounded-xl" data-testid="submit-post-btn">
                    {loading ? 'Pubblicando...' : 'Pubblica'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Winners Only Badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span>{t('community.winners')}</span>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <Card className="bg-card/80 border-border/50 col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nessun post ancora</p>
              <p className="text-sm text-muted-foreground">Sii il primo a condividere!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/80 border-border/50 overflow-hidden community-card" data-testid={`post-${post.id}`}>
                {/* Image */}
                {post.image_url ? (
                  <div className="aspect-video bg-secondary">
                    <img 
                      src={post.image_url} 
                      alt="Trade screenshot"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                )}

                <CardContent className="p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {post.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{post.user_name}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                    </div>
                    {post.profit > 0 && (
                      <span className="ml-auto px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                        +${post.profit}
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  <p className="text-sm mb-4">{post.caption}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400 transition-colors"
                      data-testid={`like-${post.id}`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
