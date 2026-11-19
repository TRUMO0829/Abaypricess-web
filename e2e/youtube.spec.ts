import { expect, test } from "@playwright/test"

import { youtubeId } from "../src/components/home/intro-video"

test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "pure function"))

test("YouTube холбоосын төрөл бүрээс id гаргана", () => {
  const id = "jNQXAC9IVRw"
  for (const url of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=30s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
  ]) {
    expect(youtubeId(url), url).toBe(id)
  }
  expect(youtubeId("")).toBeNull()
  expect(youtubeId("https://vimeo.com/123")).toBeNull()
  expect(youtubeId("not a url")).toBeNull()
})
