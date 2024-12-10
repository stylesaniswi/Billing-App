"use client";

import { NextPage } from 'next';
import PageForm from '@/components/pages/PageForm';

const createPage: NextPage = () => {
  const handleCreate = async (data: { title: string; slug: string; content: string; published: boolean }) => {
    // Call API to create a new page
    await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // Redirect or show success message
  };

  return (
    <div>
      <h1>Create Page</h1>
      <PageForm onSubmit={handleCreate} />
    </div>
  );
};

export default createPage; 