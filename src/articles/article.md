---
title: yeah
snippet:
  code: |2
      <main>
    +   {#each articles as { path, title, snippet }}
          <div class="card">
    +       {#if snippet}
              <Prism {...snippet} />
    +       {/if}
            <h2><a href={path} sveltekit:prefetch>{title}</a></h2>
          </div>
    +   {/each}
      </main>
  lang: diff-svelte
---

!!
