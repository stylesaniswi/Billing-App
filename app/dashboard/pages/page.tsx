"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const PagesList: NextPage = () => {
  const { data: session } = useSession();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const canManagePages =
    session?.user?.role === "ADMIN" || session?.user?.role === "ACCOUNTANT";
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch("/api/pages"); // Adjust the API endpoint as necessary
        const data = await response.json();
        setPages(data);
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        const response = await fetch(`/api/pages/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setPages(pages.filter((page) => page.id !== id)); // Update the state to remove the deleted page
        } else {
          console.error("Failed to delete the page");
        }
      } catch (error) {
        console.error("Error deleting page:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <Button asChild>
          <Link href="pages/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              {canManagePages && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>{page.published ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {new Date(page.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(page.updatedAt).toLocaleString()}
                </TableCell>
                {canManagePages && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Link
                            className="flex"
                            key={`pages/${page.id}`}
                            href={`pages/${page.id}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PagesList;
