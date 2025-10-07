"use client";
import React from "react";

type Blog = {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  authorAvatar?: string;
};

type BlogSectionProps = {
  blogs?: Blog[];
  onCardClick?: (blog: Blog) => void;
};

/*Card*/

const categoryStyles: Record<string, { bg: string; text: string }> = {
  Sales: { bg: "bg-[#FBF6F0]", text: "text-[#6E461A]" },
  Operations: { bg: "bg-[#FBF6F0]", text: "text-[#6E461A]" },
  Growth: { bg: "bg-[#FBF6F0]", text: "text-[#6E461A]" },
};

function BlogCard({ blog, onClick }: { blog: Blog; onClick?: () => void }) {
  const badge = categoryStyles[blog.category] || {
    bg: "bg-[#FBF6F0]",
    text: "text-[#6E461A]",
  };

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
      role="button"
      onClick={onClick}
    >
      {/* Image */}
      <div className="p-3">
        <div className="overflow-hidden rounded-xl">
          <img
            src={blog.image}
            alt={blog.title}
            className="h-48 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        {/* Badge */}
        <div className="flex">
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
              badge.bg,
              badge.text,
              "self-start", // align badge at start (left)
            ].join(" ")}
          >
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-[20px] font-bold leading-snug text-[#495057] hover:text-slate-700 text-left">
          {blog.title}
        </h3>

        {/* Author / meta */}
        <div className="mt-4 flex items-center gap-3 text-[13px] text-slate-600">
          <img
            src={blog.authorAvatar || "https://i.pravatar.cc/40?img=" + ((blog.id % 70) + 1)}
            alt={blog.author}
            className="h-9 w-9 rounded-full"
            loading="lazy"
          />
          <div className="leading-tight">
            <div className="font-medium text-slate-800 text-left text-[16px]">{blog.author}</div>
            <div className="flex items-center gap-2 text-[12px] mt-1">
              <span>{blog.date}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/*Section*/

const BlogSection: React.FC<BlogSectionProps> = ({
  blogs = [
    {
      id: 1,
      category: "Sales",
      title: "5 Proven Sales Pipeline Strategies for Agencies",
      author: "John Carter",
      date: "Feb 10, 2022",
      readTime: "8 min read",
      image: "/blog1.svg",
    },
    {
      id: 2,
      category: "Operations",
      title: "How Automation Transforms Client Management",
      author: "Annette Black",
      date: "Feb 10, 2022",
      readTime: "8 min read",
      image: "/blog2.svg",
    },
    {
      id: 3,
      category: "Growth",
      title: "The Future of Commission Tracking in Service Businesses",
      author: "Ralph Edwards",
      date: "Feb 10, 2022",
      readTime: "8 min read",
      image: "/blog3.svg",
    },
  ],
  onCardClick,
}) => {
  return (
    <section id="blogs" className="w-full bg-white mt-6 scroll-mt-20">
      <div className="mx-auto w-[90%] px-4">
        {/* Header */}
        <div className="pt-8 text-center">
          <div className="text-[22px] font-extrabold tracking-wider uppercase  text-primary">Our Blog</div>
          <h2 className="mt-2 text-[40px] font-bold text-[#0A1425] sm:text-4xl">Resource Center</h2>
          <p className="mx-auto mt-3 max-w-3xl text-[20px] leading-relaxed text-[#0A1425]">
            Stay ahead with expert insights, strategies, and tips to help your team close more deals, streamline
            operations, and scale smarter.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-8 grid w-full grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <BlogCard key={b.id} blog={b} onClick={() => onCardClick?.(b)} />
          ))}
        </div>

        {/* CTA */}
        <div className="mb-10 mt-8 flex justify-center">
          <a
            href="#"
            className="rounded-lg border border-[#6E461A] bg-transparent px-6 py-2 text-[16px] font-semibold text-amber-900 hover:bg-[#6E461A] hover:text-white"
          >
            Browse All Articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
