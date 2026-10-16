/*
 * Review flags for the rating form. When a rating is created from an App
 * Suggestion (Admin > App Suggestions > Create rating), the questions the
 * submitter answered "Not sure" are flagged so the reviewer can find them in
 * the form. Flags are keyed by the question's stored value (unique across the
 * Yes/No groups — see ReviewFlags.test.ts) and live only in this context, so
 * nothing is saved on the rating, and every other use of the rating form gets
 * the empty default and renders exactly as before.
 */
import * as React from 'react';

export interface ReviewFlagsState {
  flagged: Set<string>; // question values to highlight
  reviewed: Set<string>; // flagged questions the reviewer has since answered
  markReviewed: (value: string) => void;
}

const EMPTY: ReviewFlagsState = { flagged: new Set(), reviewed: new Set(), markReviewed: () => {} };

export const ReviewFlagsContext = React.createContext<ReviewFlagsState>(EMPTY);

export const useReviewFlags = () => React.useContext(ReviewFlagsContext);

// Provider state for a set of flagged question values; resets when the flags change.
export const useReviewFlagsState = (flaggedValues: string[]): ReviewFlagsState => {
  const key = flaggedValues.join('\u0000');
  const flagged = React.useMemo(() => new Set(key ? key.split('\u0000') : []), [key]);
  const [reviewed, setReviewed] = React.useState<Set<string>>(new Set());
  React.useEffect(() => setReviewed(new Set()), [key]);
  const markReviewed = React.useCallback(
    (value: string) => flagged.has(value) && setReviewed(prev => (prev.has(value) ? prev : new Set(prev).add(value))),
    [flagged]
  );
  return React.useMemo(() => ({ flagged, reviewed, markReviewed }), [flagged, reviewed, markReviewed]);
};
