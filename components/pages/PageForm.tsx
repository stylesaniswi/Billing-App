import { useState } from 'react';

interface PageFormProps {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    published: boolean;
  };
  onSubmit: (data: { title: string; slug: string; content: string; published: boolean }) => void;
}
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

const PageForm: React.FC<PageFormProps> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [published, setPublished] = useState(initialData?.published || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, slug, content, published });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="published">Published &nbsp;</Label>
        <Checkbox
          checked={published}
          onClick={(e) => setPublished(!published)}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default PageForm; 