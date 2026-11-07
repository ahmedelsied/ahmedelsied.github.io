export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  relationship: string;
  date: string;
}

export const useTestimonials = () => {
  const items: Testimonial[] = [];

  return { items };
};
