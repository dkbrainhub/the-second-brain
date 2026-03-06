import React, { useState, useEffect } from 'react';

export default function StickyReadingTime({ readingTime }: { readingTime?: number }) {
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);

  useEffect(() => {
    // Use prop if available, otherwise extract from page DOM
    if (readingTime) {
      setEstimatedMinutes(Math.ceil(readingTime));
    } else {
      const article = document.querySelector('article');
      if (article) {
        const wordsPerMinute = 160;
        const wordCount = article.innerText.trim().split(/\s+/).length;
        setEstimatedMinutes(Math.ceil(wordCount / wordsPerMinute));
      }
    }
  }, [readingTime]);

  if (!estimatedMinutes) return null;

  return (
    <div className="reading-time-badge">
      <span>📖 {estimatedMinutes} min read</span>
    </div>
  );
}
