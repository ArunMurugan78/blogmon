import axios from "axios";
import { BlogPostConfig } from "../types/BlogPostConfig";
const HASHNODE_API_URL = "https://api.hashnode.com/";
const getLatestHashnodePosts = async (username: string, page = 0): Promise<BlogPostConfig> => {
    try {
        const result = await axios.post(HASHNODE_API_URL, {
            query: `query{
              user(username: "${username}") {
                  publicationDomain
                  publication {
                    posts(page:${page}) {
                      author{
                        username
                        name
                        photo
                      }
                      title
                      coverImage
                      dateAdded
                      brief
                      slug
                    }
                  }
              }
          }`,
        });
        const domain = result.data.data.user.publicationDomain;
        const posts = result.data.data.user.publication.posts;
        return posts.map((post: any): BlogPostConfig => {
            return {
                url: `https://${domain}/${post.slug}`,
                title: post.title,
                thumbnail: post.coverImage,
            };

        });

    } catch (error) {
        console.error(error);
        return error;
    }
};

export default getLatestHashnodePosts;
