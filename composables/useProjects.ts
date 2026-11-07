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
      description: 'National innovation platform.',
      tags: ['PHP', 'Laravel'],
      href: 'https://egyptinnovate.com/',
      year: '',
      icon: 'lucide:lightbulb',
      group: 'work',
      featured: true,
    },
    {
      title: 'Fitexpert',
      description: 'Fitness and wellness platform.',
      tags: ['PHP', 'Laravel'],
      href: 'https://fitexpert.team/',
      year: '',
      icon: 'lucide:dumbbell',
      group: 'work',
      featured: true,
    },
    {
      title: 'Elsafwa Resort',
      description: 'Resort website for Elsafwa.',
      tags: ['PHP', 'Laravel'],
      href: 'https://www.elsafwa.com.eg/',
      year: '',
      icon: 'lucide:palmtree',
      group: 'work',
      featured: true,
    },
    {
      title: 'Circles Academy',
      description: 'Academy website for Circles.',
      tags: ['PHP', 'Laravel'],
      href: 'https://circlesacademy.info/',
      year: '',
      icon: 'lucide:graduation-cap',
      group: 'work',
    },
    {
      title: 'Itrainer',
      description: 'Fitness training site.',
      tags: ['PHP', 'Laravel'],
      href: 'http://itrainer.fit/',
      year: '',
      icon: 'lucide:activity',
      group: 'work',
    },
    {
      title: 'filament-media-browser',
      description:
        'A shared media library for Filament 3, 4, and 5. Editors keep images and documents in one library, then attach the same file to many records. Ships with a default driver and a Spatie Media Library driver. MIT-licensed, published as a0x01/filament-media-browser.',
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
