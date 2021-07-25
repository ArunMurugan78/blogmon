import { BlogPost, Config, BlogsPageIterator } from "../../interfaces";
import { getHashNodeArticles } from "./getHashNodeArticles";

export class HashnodeBlogsPaginator implements BlogsPageIterator {
  private userName: string;

  private page = 0;

  private perPage = 6;

  private done = false;

  private buffer: BlogPost[] = [];

  constructor(config: Config) {
    this.userName = config.userName;

    if (typeof config.perPage === "number" && config.perPage > 0) {
      this.perPage = config.perPage;
    }
  }

  async hasNext(): Promise<boolean> {
    return (
      !this.done &&
      (await getHashNodeArticles(this.userName, this.page)).length > 0
    );
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<BlogPost[]> {
    return this;
  }

  async next(): Promise<IteratorResult<BlogPost[]>> {
    while (this.buffer.length < this.perPage && !this.done) {
      // eslint-disable-next-line  no-await-in-loop
      const posts = await getHashNodeArticles(this.userName, this.page);
      if (posts.length === 0) {
        this.done = true;
      }
      this.page += 1;
      this.buffer = this.buffer.concat(posts);
    }

    return { value: this.buffer.splice(0, this.perPage), done: this.done };
  }

  async nextPage(): Promise<BlogPost[] | null> {
    const { value, done } = await this.next();
    if (done) return null;

    return value;
  }
}

export default HashnodeBlogsPaginator;
