import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "samuel.m",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    // TODO: set this to your real production domain (no protocol), e.g. "samuelmcclanahan.com"
    baseUrl: "samuel-m.example.com",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Montserrat",
        body: "Mulish",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#f4f0ea",
          lightgray: "#e0d8cc",
          gray: "#8a7a6e",
          darkgray: "#3d3530",
          dark: "#1a1410",
          secondary: "#9a2a24",
          tertiary: "#c8413a",
          highlight: "rgba(154, 42, 36, 0.10)",
          textHighlight: "#c8413a40",
        },
        darkMode: {
          light: "#0a0807",
          lightgray: "#2a1d1a",
          gray: "#7a7268",
          darkgray: "#bdb6ad",
          dark: "#f0ebe2",
          secondary: "#e8a59f",
          tertiary: "#c8413a",
          highlight: "rgba(120, 40, 35, 0.15)",
          textHighlight: "#c8413a55",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
