import React from "react";

type Review = {
  id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  author: string;
  timeAgo: string;
};

type ReviewsSectionProps = {
  heading?: string;
  subheading?: string;
  reviews?: Review[];
};

const defaultReviews: Review[] = [
  {
    id: 1,
    rating: 5,
    title: "Pricing is amazing for the small businesses around the world.",
    body: "Our pricing is tailored to suit the needs of small businesses worldwide, offering affordable and competitive rates that provide excellent value..",
    author: "Marvin McKinney",
    timeAgo: "3 months ago",
  },
  {
    id: 2,
    rating: 5,
    title: "Great Service from a expert support system of Validiz.",
    body: "Our application is undergoing significant improvements with the help of NioLand, resulting in enhanced functionality, improved user experience..",
    author: "Dianne Russell",
    timeAgo: "3 months ago",
  },
  {
    id: 3,
    rating: 5,
    title: "We’re building a better application now, thanks to Validiz.",
    body: "Experience exceptional service and support from NioLand’s expert team, dedicated to providing knowledgeable assistance.",
    author: "Wade Warren",
    timeAgo: "3 months ago",
  },
];

const Star = ({ filled }: { filled?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? "fill-amber-500" : "fill-slate-200"}`}>
    <path d="M10 1.6 12.7 7l5.9.8-4.3 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9L1.4 7.8 7.3 7 10 1.6Z" />
  </svg>
);

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  heading = "What Our Customers\nAre Saying",
  subheading = "Reviews",
  reviews = defaultReviews,
}) => {
  return (
    <section className="w-full bg-white mt-6">
      <div className="mx-auto w-[90%] px-4">
        {/* Header */}
        <header className="pt-10 text-center">
          <h2 className="whitespace-pre-line text-3xl font-bold tracking-normal leading-loose text-slate-900 sm:text-4xl">
            {heading}
          </h2>
          <div className="mt-3 text-[22px] font-extrabold uppercase tracking-[0.22em] text-primary">{subheading}</div>
        </header>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Stars */}
              <div className="mb-3 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < r.rating} />
                ))}
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-semibold leading-snug text-[#0A1425] text-left">{r.title}</h3>

              {/* Body */}
              <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-[#0A1425] text-left">{r.body}</p>

              {/* Footer */}
              <div className="mt-6">
                <div className="font-semibold text-[#0A1425] text-left text-[18px]">{r.author}</div>
                <div className="text-[12.5px] text-[#495057] text-left">{r.timeAgo}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
