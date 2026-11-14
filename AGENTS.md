<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use TanStack Start SPA mode and defaultSsr: false; only the shared document shell is rendered at build time so native clients need no SSR server.
- Capacitor packages .output/public; the post-build preparation validates and copies real client output, never creates placeholder HTML or bundles server output.
- Static packaging does not make secret-backed AI calls offline; keep credentials on the hosted service and never put them in native client bundles.
