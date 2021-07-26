import { fetchBlogs } from "./fetchBlogs";
import { BlogPost, Config, BlogPostIterator } from "../../interfaces";

import { BlogPageIteratorBase } from "../BlogPageIteratorBase";

export class DevtoPostIterator
  extends BlogPageIteratorBase
  implements BlogPostIterator
{
  private page = 1;

  private userName: string;

  private perPage = 6;

  private done = false;

  constructor(config: Config) {
    super();

    this.userName = config.userName;
    if (typeof config.perPage === "number" && config.perPage > 0) {
      this.perPage = config.perPage;
    } else if (typeof config.perPage !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn("Expected perPage to be a positive number");
    }
  }

  async next(): Promise<IteratorResult<BlogPost[]>> {
    const value = await fetchBlogs(this.userName, this.perPage, this.page);

    this.page += 1;

    if (value.length === 0) {
      this.done = true;
    }

    return { value, done: this.done };
  }
}
