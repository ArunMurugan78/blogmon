import axios from "axios";
import { BlogsPaginatorInterface } from "../../types/BlogsPaginatorInterface";
import { BlogPostInterface } from "../../types";
import { validDateOrUndefined } from "../../utils";
import { Config } from "../../types/Config";

const HASHNODE_API_URL = "https://api.hashnode.com/";

const getPublicationDomianOrDefault = (
  userName: string,
  publicationDomain: string
): string => publicationDomain.trim() || `${userName}.hashnode.dev`;

const toBlogData =
  (userName: string, publicationDomain: string) =>
  (post: any): BlogPostInterface => ({
    url: `https://${getPublicationDomianOrDefault(
      userName,
      publicationDomain
    )}/${post.slug}`,
    title: post.title,
    coverImageUrl: post.coverImage ?? "",
    description: post.brief ?? "",
    tags: post.tags.map((tag: any): string => tag.name).filter(Boolean),
    dateAdded: validDateOrUndefined(post.dateAdded),
    dateEdited: validDateOrUndefined(post.dateUpdated),
  });

const pipeThrowErrorIfUserNameIsEmpty = <
  T extends { username?: string | null }
>(
  data: T
): T => {
  if (typeof data?.username !== "string" || data.username.trim().length === 0) {
    throw new Error("username is wrong");
  }

  return data;
};

// Fetches articles published at HashNode. Can Only get a maximum of 6 articles at a time.
const getHashNodeArticles = async (
  username: string,
  page: number
): Promise<BlogPostInterface[]> =>
  axios
    .post(HASHNODE_API_URL, {
      query: `query{
            user(username: "${username}") {
                username
                publicationDomain
                publication {
                  posts(page:${page}) {
                    title
                    coverImage
                    brief
                    dateAdded
                    dateUpdated
                    slug
                    tags {
                      name
                    }
                  }
                }
            }
        }`,
    })
    .then((response) => response.data?.data?.user)
    .then(pipeThrowErrorIfUserNameIsEmpty)
    .then(({ publicationDomain, publication: { posts } }) => ({
      posts,
      publicationDomain,
    }))
    .then(({ posts, publicationDomain }) =>
      posts.map(toBlogData(username, publicationDomain))
    );

export class HashnodeBlogsPaginator implements BlogsPaginatorInterface {
  private userName: string;

  private page = 0;

  private perPage = 6;

  private done = false;

  private buffer: BlogPostInterface[] = [];

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

  [Symbol.asyncIterator](): AsyncIterableIterator<BlogPostInterface[]> {
    return this;
  }

  async next(): Promise<IteratorResult<BlogPostInterface[]>> {
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

  async nextPage(): Promise<BlogPostInterface[] | null> {
    const { value, done } = await this.next();
    if (done) return null;

    return value;
  }
}

export default HashnodeBlogsPaginator;
