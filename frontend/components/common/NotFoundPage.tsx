import React from "react";
import img from "@/assets/not-found-page.png";
import Image from "next/image";

interface NotFoundPageProps {
  text?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  text = "Page not found",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Image
        src={img}
        alt="not-found"
        width={300}
        height={300}
        className="object-contain"
      />
      <p className="mt-4 text-lg font-medium text-gray-600">{text}</p>
    </div>
  );
};

export default NotFoundPage;
