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
      title: 'Software Engineer',
      start: '2024-11-01',
      end: null,
      location: 'Remote, Cairo, Egypt',
      highlights: [
        'Developed and maintained highly scalable backend systems using both Laravel and NestJS, leveraging tools like Filament and Spatie to build efficient admin dashboards.',
        'Architected and secured RESTful APIs across Laravel (Sanctum/Passport) and NestJS environments for seamless integration with frontend applications and third-party services.',
        'Designed and optimized complex relational databases (MySQL/PostgreSQL), crafting efficient schemas and advanced queries to maximize system performance.',
        'Accelerated development and system design by integrating AI-powered tools (Cursor, Model Context Protocol) to write robust unit tests, produce technical documentation, and rapidly debug complex issues.',
        'Built and managed automated CI/CD pipelines incorporating linting, static and security analysis, dependency tracking, and Trivy scans to ensure reliable and secure deployments.',
        'Championed agile best practices by collaborating closely with Product, Frontend, and DevOps teams during sprint planning, technical estimations, and rigorous code reviews.',
        'Mentored junior developers on backend best practices, Eloquent optimization, package integration, and modern frameworks (Laravel and NestJS) to accelerate team growth.',
      ],
    },
    {
      company: 'Almasa',
      title: 'Backend Team Lead',
      start: '2024-07-01',
      end: '2024-11-01',
      location: 'Kuwait',
      highlights: [
        'Led a 3-developer backend team to build and launch an internal e-commerce dashboard and mobile API using Laravel.',
        'Introduced a domain-oriented architecture to decouple features and ensure the system could scale sustainably without turning into a monolith.',
        'Developed and shipped critical API features, including real-time chat, an integrated notification system, and secure payment processing via SadadPay.',
        'Conducted code reviews, coaching the team on structural best practices and system design rather than just line-level changes.',
        'Managed backend estimations and sprint planning, actively scoping and adjusting feature requirements to ensure consistent on-time delivery.',
        'Balanced technical leadership with active contribution, personally coding complex integrations like the real-time chat, notifications, and SadadPay.',
      ],
    },
    {
      company: 'Codebase-tech',
      title: 'Backend Developer',
      start: '2022-01-01',
      end: '2024-01-01',
      location: 'Al Dakahlia, Egypt',
      highlights: [
        'Over a two-year period, I contributed to the entire software development lifecycle (SDLC) of multiple complex projects, from architecture design to deployment, with a focus on backend development using PHP/Laravel and MySQL.',
        'Designed scalable, secure, and high-performance systems.',
        'Integrated third-party APIs and optimized databases for high-traffic efficiency.',
        'Resolved performance bottlenecks and managed complex system integrations.',
        'Collaborated with cross-functional teams to deliver reliable, on-time solutions.',
        'Contributed to technical decision-making for maintainable and efficient architectures.',
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
        'Implemented assigned backend changes and fixed defects found in review.',
        'Traced slow paths with senior developers and checked the fix before a feature shipped.',
        "Worked from the team's review notes so the next change matched the existing codebase.",
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
        'Designed MySQL schemas and the application structure those backends were built on.',
        'Took each project from agreed requirements through deployment.',
        'Stayed with the client after launch for fixes and follow-on work.',
      ],
    },
  ];

  return { roles };
};
