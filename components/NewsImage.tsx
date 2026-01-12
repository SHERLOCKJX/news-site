'use client';

import { useState, useEffect } from 'react';

interface NewsImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt: string;
  fallbackText?: string;
  category?: string;
  keyword?: string | null;
}

export default function NewsImage({ src, alt, className, fallbackText = 'News', category, keyword, ...props }: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(src || '');
  }, [src]);

  const getPlaceholder = () => {
     // Use keyword if available for dynamic text
     let text = keyword || category || fallbackText;
     if (text.length > 15) text = text.substring(0, 15); // limit length
     
     // Use category to determine color or style
     let bg = 'e2e8f0'; // gray-200
     let fg = '1e293b'; // slate-800
     
     if (category) {
       switch(category.toLowerCase()) {
         case 'tech':
           bg = 'e0f2fe'; // sky-100
           fg = '0369a1'; // sky-700
           break;
         case 'business':
           bg = 'dcfce7'; // green-100
           fg = '15803d'; // green-700
           break;
         case 'world':
           bg = 'fee2e2'; // red-100
           fg = 'b91c1c'; // red-700
           break;
         case 'opinion':
           bg = 'fef9c3'; // yellow-100
           fg = 'a16207'; // yellow-700
           break;
       }
     }
     
     return `https://placehold.co/600x400/${bg}/${fg}?text=${encodeURIComponent(text.toUpperCase())}`;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getPlaceholder());
    }
  };

  if (!src) {
    return (
      <img
        src={getPlaceholder()}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
