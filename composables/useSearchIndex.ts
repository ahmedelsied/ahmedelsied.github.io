import MiniSearch from 'minisearch';
import type { ParsedQuery, SortMode } from './useSearchQuery';

export type SearchKind = 'article' | 'project' | 'opensource' | 'page';

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  tags: string[];
  date?: string;
  year?: string;
  href: string;
  external: boolean;
  icon: string;
}

export interface SearchResult extends SearchItem {
  score: number;
}

const staticPageIcons: Record<string, string> = {
  about: 'lucide:user',
  projects: 'lucide:folder-git-2',
  blog: 'lucide:notebook-pen',
  contact: 'lucide:mail',
};

export async function useSearchIndex() {
  const { t, locale } = useI18n();
  const localePath = useLocalePath();
  const { work, openSource } = useProjects();

  const isArabicLocaleInitial = locale.value.toLowerCase().startsWith('ar');
  const initialCollection = isArabicLocaleInitial ? 'writesAr' : 'writes';

  const { data: posts } = await useAsyncData(`search-index-${initialCollection}`, async () => {
    const rows = await queryCollection(initialCollection).order('date', 'DESC').all();
    if (rows.length > 0 || initialCollection === 'writes') return rows;
    return queryCollection('writes').order('date', 'DESC').all();
  });

  const items = computed<SearchItem[]>(() => {
    const list: SearchItem[] = [];

    posts.value?.forEach((p) => {
      const externalPath = (p.path ?? '').replace(/^\/writes-ar\//, '/writes/');
      list.push({
        id: `article:${externalPath}`,
        kind: 'article',
        title: p.title,
        description: p.description ?? '',
        tags: p.keywords ?? [],
        date: p.date,
        href: localePath(externalPath),
        external: false,
        icon: 'lucide:pen-line',
      });
    });

    work.forEach((w) => {
      list.push({
        id: `project:${w.title}`,
        kind: 'project',
        title: w.title,
        description: w.description,
        tags: w.tags,
        year: w.year,
        date: `${w.year}-01-01`,
        href: w.href ?? w.repo ?? localePath('/projects'),
        external: Boolean(w.href ?? w.repo),
        icon: w.icon ?? 'lucide:briefcase-business',
      });
    });

    openSource.forEach((o) => {
      list.push({
        id: `opensource:${o.title}`,
        kind: 'opensource',
        title: o.title,
        description: o.description,
        tags: o.tags,
        year: o.year,
        date: `${o.year}-01-01`,
        href: o.href ?? o.repo ?? localePath('/projects'),
        external: Boolean(o.href ?? o.repo),
        icon: o.icon ?? 'lucide:package',
      });
    });

    const staticPages: Array<{ key: 'about' | 'projects' | 'blog' | 'contact'; path: string }> = [
      { key: 'about', path: '/about' },
      { key: 'projects', path: '/projects' },
      { key: 'blog', path: '/writes' },
      { key: 'contact', path: '/contact' },
    ];

    staticPages.forEach(({ key, path }) => {
      list.push({
        id: `page:${path}`,
        kind: 'page',
        title: t(`meta.${key}.title`),
        description: t(`meta.${key}.description`),
        tags: [],
        href: localePath(path),
        external: false,
        icon: staticPageIcons[key] ?? 'lucide:file',
      });
    });

    return list;
  });

  const engine = computed(() => {
    const ms = new MiniSearch<SearchItem>({
      idField: 'id',
      fields: ['title', 'description', 'tags'],
      storeFields: ['id'],
      searchOptions: {
        boost: { title: 3, tags: 2, description: 1 },
        prefix: true,
        fuzzy: 0.2,
        combineWith: 'AND',
      },
    });
    ms.addAll(items.value);
    return ms;
  });

  const byId = computed(() => {
    const map = new Map<string, SearchItem>();
    items.value.forEach((it) => map.set(it.id, it));
    return map;
  });

  const allTags = computed(() => {
    const set = new Set<string>();
    items.value.forEach((it) => it.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  function search(query: string): SearchResult[] {
    const q = query.trim();
    if (!q) return [];
    return engine.value
      .search(q)
      .map((r) => {
        const item = byId.value.get(r.id as string);
        if (!item) return null;
        return { ...item, score: r.score };
      })
      .filter((v): v is SearchResult => v !== null);
  }

  function passesFilters(item: SearchItem, parsed: ParsedQuery) {
    if (parsed.kinds.size && !parsed.kinds.has(item.kind)) return false;
    if (parsed.tags.size && !item.tags.some((t) => parsed.tags.has(t))) return false;
    if (parsed.from || parsed.to) {
      if (!item.date) return false;
      const d = new Date(item.date);
      if (parsed.from && d < new Date(`${parsed.from}-01`)) return false;
      if (parsed.to) {
        const [yStr, mStr] = parsed.to.split('-') as [string, string];
        const end = new Date(Number(yStr), Number(mStr), 0);
        if (d > end) return false;
      }
    }
    return true;
  }

  function sortResults(list: SearchResult[], mode: SortMode) {
    const out = [...list];
    if (mode === 'relevance') {
      out.sort((a, b) => b.score - a.score);
    } else if (mode === 'newest') {
      out.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    } else if (mode === 'oldest') {
      out.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
    }
    return out;
  }

  function run(parsed: ParsedQuery): SearchResult[] {
    const text = parsed.text.trim();
    const base = text ? search(text) : items.value.map((item) => ({ ...item, score: 0 }));
    const filtered = base.filter((it) => passesFilters(it, parsed));
    const mode: SortMode = parsed.sort ?? (text ? 'relevance' : 'newest');
    return sortResults(filtered, mode);
  }

  return {
    items,
    allTags,
    search,
    run,
  };
}
