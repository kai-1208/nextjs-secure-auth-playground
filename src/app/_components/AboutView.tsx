"use client";

import type { About } from "@/app/_types/About";
import DOMPurify from "isomorphic-dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faSpinner } from "@fortawesome/free-solid-svg-icons";

type Props = {
  about: About;
};

export const AboutView: React.FC<Props> = (props) => {
  const { about } = props;
  const sanitizedContent = DOMPurify.sanitize(about.aboutContent, {
    ALLOWED_TAGS: ["b", "i", "font", "br"], // 許可するタグ
    ALLOWED_ATTR: ["color", "size"], // 許可する属性
  });
  return (
    <div>
      <div className="mb-2 flex flex-col gap-y-3">
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faIdCard} className="mr-1.5" />
          {about.userName}
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          className="mr-1"
        />
      </div>
    </div>
  );
};
