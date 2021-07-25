import axios from "axios";
import { HashnodeBlogsPaginator } from ".";
import { BlogsPageIterator } from "../../interfaces";

jest.setTimeout(25000);

describe("HashNode Blog Iterator", () => {
  function assertForUserName(userName: string, perPage = 1, maxIterations = 3) {
    it(
      "should be able to iterate through blog pages of given size for userName: " +
        userName,
      async () => {
        const blogIterator: BlogsPageIterator = new HashnodeBlogsPaginator({
          userName,
          perPage,
        });

        let iter = 0;

        const s = new Set();

        for await (const blogPage of blogIterator) {
          expect(blogPage.length).toEqual(perPage);

          for (const blog of blogPage) {
            expect(s.has(blog.url)).toEqual(false);

            expect(typeof blog.url).toEqual("string");

            await axios(blog.url, { method: "HEAD" });

            s.add(blog.url);

            expect(blog.tags).toBeInstanceOf(Array);
            expect(typeof blog.title).toEqual("string");
            expect(typeof blog.description).toEqual("string");
            expect(typeof blog.coverImageUrl).toEqual("string");

            if (blog.dateAdded) expect(blog.dateAdded).toBeInstanceOf(Date);

            if (blog.dateEdited) expect(blog.dateEdited).toBeInstanceOf(Date);
          }

          iter++;

          if (iter === maxIterations) {
            break;
          }
        }
      }
    );
  }

  assertForUserName("arunmurugan");
  assertForUserName("victoria", 3, 2);

  it("should throw error if userName is wrong", async () => {
    const blogIterator = new HashnodeBlogsPaginator({
      userName: "wrongsdhfishdjk",
      perPage: 2,
    });

    await expect(blogIterator.next()).rejects.toThrowError();
  });
});
