/**
 * @file SearchService.ts
 * @description Service for handling prompt search operations and real-time filtering
 */

import { IPC_CHANNELS, Prompt, IPCResponse } from '../ipc-types';
import { ipcRenderer } from 'electron';

export interface SearchOptions {
  query: string;
  categories?: string[];
  tags?: string[];
  limit?: number;
}

export class SearchService {
  private prompts: Prompt[] = [];
  private lastQuery = '';
  private searchTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the search service
   */
  public async initialize(): Promise<void> {
    try {
      const response = await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_GET_ALL) as IPCResponse<Prompt[]>;
      if (response.success) {
        this.prompts = response.data;
      } else {
        console.error('Failed to initialize SearchService:', response.error);
      }
    } catch (error) {
      console.error('Error initializing SearchService:', error);
    }
  }

  /**
   * Perform a real-time search with debouncing
   * @param options Search options including query string and filters
   * @returns Promise with filtered prompts
   */
  public async search(options: SearchOptions): Promise<Prompt[]> {
    return new Promise((resolve) => {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(async () => {
        const results = this.filterPrompts(options);
        resolve(results);
      }, 300); // 300ms debounce
    });
  }

  /**
   * Filter prompts based on search options
   * @param options Search options
   * @returns Filtered array of prompts
   */
  private filterPrompts(options: SearchOptions): Prompt[] {
    const { query, categories = [], tags = [], limit } = options;
    const searchQuery = query.toLowerCase();

    let filtered = this.prompts.filter(prompt => {
      // Match title and content
      const titleMatch = prompt.title.toLowerCase().includes(searchQuery);
      const contentMatch = prompt.content.toLowerCase().includes(searchQuery);

      // Match categories if specified
      const categoryMatch = categories.length === 0 ||
        (prompt.category && categories.includes(prompt.category));

      // Match tags if specified
      const tagMatch = tags.length === 0 ||
        (prompt.tags && prompt.tags.some(tag => tags.includes(tag)));

      return (titleMatch || contentMatch) && categoryMatch && tagMatch;
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get unique categories from all prompts
   * @returns Array of unique categories
   */
  public getCategories(): string[] {
    const categories = new Set<string>();
    this.prompts.forEach(prompt => {
      if (prompt.category) {
        categories.add(prompt.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Get unique tags from all prompts
   * @returns Array of unique tags
   */
  public getTags(): string[] {
    const tags = new Set<string>();
    this.prompts.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }
}

export const searchService = new SearchService();