export interface Project {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  year: string;
  icon?: string;
  group: 'work' | 'open-source';
  featured?: boolean;
}

export const useProjects = () => {
  const projects: Project[] = [
    {
      title: 'Egypt Innovate',
      description:
        "Egypt Innovate is Egypt's national gateway for entrepreneurship and innovation, connecting startups, investors, and ecosystem partners with resources and opportunities. The backend uses a layered architecture, built with Laravel 12, PHP 8.4, and MySQL 8.",
      tags: ['PHP', 'Laravel', 'MySQL'],
      href: 'https://egyptinnovate.com/',
      year: '',
      icon: 'lucide:lightbulb',
      group: 'work',
      featured: true,
    },
    {
      title: 'Fitexpert',
      description:
        'Fitexpert is a platform for fitness businesses, covering client management, nutrition and workout plans, progress tracking, and subscriptions. The backend uses a layered architecture, built with Laravel 11, PHP 8.2, and MySQL 8.',
      tags: ['PHP', 'Laravel', 'MySQL'],
      href: 'https://fitexpert.team/',
      year: '',
      icon: 'lucide:dumbbell',
      group: 'work',
      featured: true,
    },
    {
      title: 'Elsafwa Resort',
      description:
        'Elsafwa is a booking platform for resort stays across Cairo, from studios and chalets to apartments and villas, with search by destination, dates, and guests. The backend uses a layered architecture, built with Laravel 12, PHP 8.4, and MySQL 8.',
      tags: ['PHP', 'Laravel', 'MySQL'],
      href: 'https://www.elsafwa.com.eg/',
      year: '',
      icon: 'lucide:palmtree',
      group: 'work',
      featured: true,
    },
    {
      title: 'Circles Academy',
      description:
        'Circles Academy is a learning platform for clinical and sports nutrition and personal training, with accredited courses, practical training, and certificates. The backend uses a layered architecture, built with Laravel 11, PHP 8.2, and MySQL 8.',
      tags: ['PHP', 'Laravel', 'MySQL'],
      href: 'https://circlesacademy.info/',
      year: '',
      icon: 'lucide:graduation-cap',
      group: 'work',
    },
    {
      title: 'Itrainer',
      description:
        'Itrainer is a fitness application for personalized diet and workout plans, progress tracking, and subscriptions. The backend uses a microservices architecture, built with Laravel 11, PHP 8.2, and MySQL 8.',
      tags: ['PHP', 'Laravel', 'MySQL'],
      href: 'http://itrainer.fit/',
      year: '',
      icon: 'lucide:activity',
      group: 'work',
    },
    {
      title: 'filament-media-browser',
      description:
        'A shared media library for Filament 3, 4, and 5. Editors keep images and documents in one library, then attach the same file to many records. Ships with a default driver and a Spatie Media Library driver. MIT-licensed, published as ahmedelsied/filament-media-browser.',
      tags: ['PHP', 'Laravel', 'Filament'],
      href: 'https://github.com/ahmedelsied/filament-media-browser',
      repo: 'https://github.com/ahmedelsied/filament-media-browser',
      year: '2026',
      icon: 'lucide:images',
      group: 'open-source',
      featured: true,
    },
  ];

  return {
    projects,
    work: projects.filter((p) => p.group === 'work'),
    openSource: projects.filter((p) => p.group === 'open-source'),
    featured: projects.filter((p) => p.featured),
  };
};
