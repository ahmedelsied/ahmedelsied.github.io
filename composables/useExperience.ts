export interface Role {
  company: string;
  title: string;
  start: string;
  end: string | null;
  location: string;
  highlights: string[];
  link?: string;
}

export const useExperience = () => {
  const roles: Role[] = [
    {
      company: 'Robusta Technology Group',
      title: 'Backend Developer',
      start: '2024-11-01',
      end: null,
      location: 'Remote, Cairo, Egypt',
      highlights: [
        'Build and maintain Laravel applications, including Filament admin dashboards and Spatie permissions and activity log.',
        'Design MySQL and PostgreSQL schemas and write the queries those dashboards and features depend on.',
        'Ship REST APIs with Laravel Sanctum and Passport for frontend apps and third-party services.',
        'Deploy and troubleshoot with Laravel Forge and Envoyer.',
        'Mentor junior developers on Laravel, Eloquent, and package integration.',
        'Use Cursor and MCP day to day for implementation, unit tests, documentation, and debugging.',
      ],
    },
    {
      company: 'Almasa',
      title: 'Backend Team Lead',
      start: '2024-07-01',
      end: '2024-11-01',
      location: 'Kuwait',
      highlights: [
        'Led the backend team on an internal e-commerce dashboard and mobile API, built with Laravel.',
        'Introduced a domain-oriented structure so the system could keep growing without turning into one module.',
        'Shipped API features including real-time chat, a notification system, and SadadPay.',
      ],
    },
    {
      company: 'Codebase-tech',
      title: 'Backend Developer',
      start: '2022-01-01',
      end: '2024-01-01',
      location: 'Al Dakahlia, Egypt',
      highlights: [
        'Worked across the lifecycle of multiple Laravel and MySQL projects, from architecture through deployment.',
        'Integrated third-party APIs and tuned databases for higher traffic.',
        'Joined technical decisions with cross-functional teams and cleared performance bottlenecks.',
      ],
    },
    {
      company: 'Waitbuzz',
      title: 'Backend Developer (Internship)',
      start: '2021-09-01',
      end: '2021-12-01',
      location: 'Al Dakahlia, Egypt',
      highlights: [
        'Contributed to backend architecture and performance work alongside senior developers.',
        'Helped bring features up to a production standard before the end of the internship.',
      ],
    },
    {
      company: 'Freelance',
      title: 'Software Engineer',
      start: '2019-05-01',
      end: '2021-09-01',
      location: 'Egypt',
      highlights: [
        'Delivered custom PHP backends for small and mid-sized client projects.',
        'Owned the client conversation as well as the implementation.',
      ],
    },
  ];

  return { roles };
};
