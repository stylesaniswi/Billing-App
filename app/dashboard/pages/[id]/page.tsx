"use client";

import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import PageForm from '@/components/pages/PageForm';

const EditPage: NextPage<{params: {id: string}}> = ({params}) => {
  const [pageData, setPageData] = useState(null);
  useEffect(() => {
    const fetchPageData = async () => {
      const response = await fetch('/api/pages/'+params.id);
      const data = await response.json();
      setPageData(data);
    };

    fetchPageData();
  }, []);

  const handleEdit = async (data: { title: string; slug: string; content: string; published: boolean }) => {
    await fetch('/api/pages/'+params.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // Redirect or show success message
  };

  if (!pageData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Page</h1>
      <PageForm initialData={pageData} onSubmit={handleEdit} />
    </div>
  );
};

export default EditPage;